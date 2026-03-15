package com.miro.zerotrustapi.common.util;

public final class FileNameSanitizer {

    private FileNameSanitizer() {}

    public static String sanitize(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "file";
        }

        String fileName = originalFilename.trim();

        fileName = fileName.replace("\\", "/");
        int lastSlashIndex = fileName.lastIndexOf("/");
        if (lastSlashIndex >= 0) {
            fileName = fileName.substring(lastSlashIndex + 1);
        }

        fileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
        fileName = fileName.replaceAll("_+", "_");

        if (fileName.isBlank() || fileName.equals(".") || fileName.equals("..")) {
            return "file";
        }

        if (fileName.length() > 100) {
            int dotIndex = fileName.lastIndexOf('.');
            if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
                String extension = fileName.substring(dotIndex);
                String base = fileName.substring(0, dotIndex);
                int maxBaseLength = Math.max(1, 100 - extension.length());
                fileName = base.substring(0, Math.min(base.length(), maxBaseLength)) + extension;
            } else {
                fileName = fileName.substring(0, 100);
            }
        }

        return fileName;
    }
}