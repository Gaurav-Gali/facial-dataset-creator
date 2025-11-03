import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

type ReqFile = {
    fileName?: string;
    fileType?: string;
    blob?: string;
};

// --- AWS setup ---
const region = process.env.AWS_REGION!;
const bucket = process.env.AWS_S3_BUCKET!;
const tableName = process.env.AWS_DYNAMO_TABLE!;

const s3client = new S3Client({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const dynamoClient = new DynamoDBClient({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function unwrap(item: Record<string, any>) {
    const obj: Record<string, any> = {};
    for (const key in item) {
        const val = item[key];
        if (val?.S !== undefined) obj[key] = val.S;
        else if (val?.N !== undefined) obj[key] = Number(val.N);
        else if (val?.BOOL !== undefined) obj[key] = val.BOOL;
        else obj[key] = val;
    }
    return obj;
}

function sanitizeFileName(name: string) {
    return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

// --- MAIN ROUTE ---
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const files: ReqFile[] = body.files || [];
        if (!files.length) {
            console.log("❌ No files provided");
            return NextResponse.json([]);
        }

        console.log(`📥 Received ${files.length} files to upload`);

        // Step 1️⃣ Upload all images to S3 as JPEG
        const uploadedKeys: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!file.blob) {
                console.log(`⚠️ File ${i} has no blob, skipping`);
                continue;
            }

            const baseName = sanitizeFileName(file.fileName || `image-${i}`);
            const key = `uploads/${uuidv4()}-${baseName.replace(/\.[^.]+$/, "")}.jpg`;

            console.log(`📤 Uploading file ${i + 1}/${files.length} with key: ${key}`);

            try {
                // Handle both base64 and blob URLs
                let buffer: Buffer;

                if (file.blob.startsWith('data:')) {
                    // It's a base64 data URL
                    console.log(`  📝 Processing as base64 data URL`);
                    const base64Data = file.blob.replace(/^data:image\/\w+;base64,/, "");
                    buffer = Buffer.from(base64Data, "base64");
                } else if (file.blob.startsWith('blob:')) {
                    // It's a blob URL - should be converted on client side
                    console.log(`  ⚠️ Received blob URL, this should be converted to base64 on client`);
                    continue;
                } else {
                    // Assume it's raw base64
                    console.log(`  📝 Processing as raw base64`);
                    buffer = Buffer.from(file.blob, "base64");
                }

                console.log(`  📊 Buffer size: ${buffer.length} bytes`);

                if (buffer.length === 0) {
                    console.log(`  ❌ Empty buffer, skipping`);
                    continue;
                }

                // Upload to S3
                await s3client.send(
                    new PutObjectCommand({
                        Bucket: bucket,
                        Key: key,
                        Body: buffer,
                        ContentType: "image/jpeg",
                    })
                );

                uploadedKeys.push(key);
                console.log(`  ✅ Successfully uploaded: ${key}`);
            } catch (uploadErr) {
                console.error(`  ❌ Failed to upload file ${i}:`, uploadErr);
            }
        }

        console.log(`📊 Upload Summary: ${uploadedKeys.length}/${files.length} files uploaded successfully`);

        if (uploadedKeys.length === 0) {
            console.log("❌ No files were uploaded successfully");
            return NextResponse.json([]);
        }

        // Step 2️⃣ Poll DynamoDB for new data
        console.log("⏳ Waiting for Lambda processing...");
        const maxWaitTime = 60000;
        const pollInterval = 10000;
        const initialDelay = 5000;
        const startTime = Date.now();
        let allItems = [];

        await delay(initialDelay);

        while (Date.now() - startTime < maxWaitTime) {
            const res = await dynamoClient.send(new ScanCommand({ TableName: tableName }));
            allItems = res.Items?.map(unwrap) || [];
            console.log(`  📊 DynamoDB scan found ${allItems.length} total items`);

            if (allItems.length > 0) break; // exit early if items are present

            console.log(`  🔁 Waiting another ${pollInterval / 1000}s...`);
            await delay(pollInterval);
        }


        if (!allItems.length) {
            console.log("⚠️ No items found in DynamoDB after polling");
            return NextResponse.json([]);
        }

        // Step 3️⃣ Sort & take latest N entries
        const sortedItems = allItems
            .filter((item) => item.Timestamp)
            .sort(
                (a, b) =>
                    new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
            ).slice(0, files.length).reverse();

        console.log(`🎯 Selected ${sortedItems.length} most recent items from DynamoDB`);

        console.log("All Items :", allItems.map(item => item.Emotion));
        console.log("Items (Emotions):", sortedItems.map(item => item.Emotion));
        console.log("Images:", uploadedKeys.reverse());



        // Step 4️⃣ Map in required format
        const data = sortedItems.map((item, idx) => {
            let parsedRekognition = {};
            try {
                parsedRekognition = JSON.parse(item.RekognitionRaw || "{}");
            } catch {}

            return {
                id: uuidv4(),
                imageKey: uploadedKeys[idx] || "",
                metadata: {
                    Emotion: item.Emotion || "Unknown",
                    EmotionConfidence: item.EmotionConfidence || "0",
                    RekognitionRaw: parsedRekognition,
                    date: item.date || "N/A",
                    Timestamp: item.Timestamp || "N/A",
                },
            };
        });

        console.log(`✅ Returning ${data.length} items`);
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("❌ Upload API error:", err);
        console.error("❌ Stack trace:", err.stack);
        return NextResponse.json([]);
    }
}