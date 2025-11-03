export async function blobUrlToFile(blobUrl: string, fileName: string) {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type || "image/png" });
}
