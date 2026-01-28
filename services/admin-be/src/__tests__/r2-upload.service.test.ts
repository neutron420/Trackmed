import { validateImageFile } from "../services/r2-upload.service";

describe("R2 Upload Service", () => {
  describe("validateImageFile", () => {
    it("should reject when no file provided", () => {
      const result = validateImageFile(null as any);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("No file provided");
    });

    it("should reject file exceeding size limit", () => {
      const largeFile = {
        size: 6 * 1024 * 1024, // 6MB
        mimetype: "image/jpeg",
      } as Express.Multer.File;

      const result = validateImageFile(largeFile);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("File size exceeds 5MB limit");
    });

    it("should reject invalid file type", () => {
      const invalidFile = {
        size: 1024,
        mimetype: "application/pdf",
      } as Express.Multer.File;

      const result = validateImageFile(invalidFile);

      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        "Invalid file type. Only JPG, PNG, and WebP are allowed",
      );
    });

    it("should accept valid JPEG file", () => {
      const validFile = {
        size: 1024,
        mimetype: "image/jpeg",
      } as Express.Multer.File;

      const result = validateImageFile(validFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid JPG file", () => {
      const validFile = {
        size: 1024,
        mimetype: "image/jpg",
      } as Express.Multer.File;

      const result = validateImageFile(validFile);

      expect(result.valid).toBe(true);
    });

    it("should accept valid PNG file", () => {
      const validFile = {
        size: 2 * 1024 * 1024, // 2MB
        mimetype: "image/png",
      } as Express.Multer.File;

      const result = validateImageFile(validFile);

      expect(result.valid).toBe(true);
    });

    it("should accept valid WebP file", () => {
      const validFile = {
        size: 500 * 1024, // 500KB
        mimetype: "image/webp",
      } as Express.Multer.File;

      const result = validateImageFile(validFile);

      expect(result.valid).toBe(true);
    });

    it("should accept file at exactly 5MB limit", () => {
      const maxSizeFile = {
        size: 5 * 1024 * 1024, // Exactly 5MB
        mimetype: "image/png",
      } as Express.Multer.File;

      const result = validateImageFile(maxSizeFile);

      expect(result.valid).toBe(true);
    });

    it("should reject GIF files", () => {
      const gifFile = {
        size: 1024,
        mimetype: "image/gif",
      } as Express.Multer.File;

      const result = validateImageFile(gifFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file type");
    });

    it("should reject SVG files", () => {
      const svgFile = {
        size: 1024,
        mimetype: "image/svg+xml",
      } as Express.Multer.File;

      const result = validateImageFile(svgFile);

      expect(result.valid).toBe(false);
    });
  });
});
