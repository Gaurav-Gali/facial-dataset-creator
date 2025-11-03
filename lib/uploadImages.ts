import { blobUrlToFile } from "@/utils/blobToFile";

type SignedResult = { uploadUrl: string; fileUrl: string; key: string };

export async function uploadMultiple(items: (string | File)[], prefix?: string) {
    const filesMeta = items.map((it, i) => {
        if (typeof it === "string") {
            return { fileName: `image-${i}.png`, fileType: "image/png" };
        } else {
            return { fileName: it.name, fileType: it.type || "image/png" };
        }
    });

    const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: filesMeta, prefix }),
    });

    const { results } = await res.json();
    if (!results) throw new Error("Failed to get signed URLs");

    const filesToUpload: File[] = await Promise.all(
        items.map(async (it, idx) => {
            if (typeof it === "string") {
                // use original fileName from filesMeta
                const fileName = filesMeta[idx].fileName || `image-${idx}.png`;
                return await blobUrlToFile(it, fileName);
            } else {
                return it;
            }
        })
    );

    await Promise.all(
        filesToUpload.map(async (file, idx) => {
            const signed = results[idx] as SignedResult;
            // Important: set Content-Type same as used when creating the signed URL
            await fetch(signed.uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type || "application/octet-stream",
                },
                body: file,
            });
        })
    );

    return results.map((r: SignedResult) => r.fileUrl);
}
