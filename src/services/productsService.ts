import { supabase } from "../lib/supabase";

/* =========================================================
   TYPES
========================================================= */

export interface CreateProductData {
  name: string;
  store_id?: string;

  description?: string | null;
  category?: string | null;
  brand?: string | null;

  /*
   * Kept for compatibility with ProductsNew.
   * The current products table does not use this field.
   */
  product_type?: "physical" | "digital";

  price: number;

  /*
   * Supported by the current products table.
   */
  compare_price?: number | null;

  currency?: string;

  /*
   * Kept for compatibility with ProductsNew.
   * The current products table does not use these fields.
   */
  sku?: string | null;
  track_inventory?: boolean;
  stock_quantity?: number;

  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;

  options?: Record<string, string[]> | null;

  status?: "draft" | "published" | "archived";
}

export interface ProductImageUpload {
  productId: string;
  file: File;
  sortOrder?: number;
}

export interface SaveProductImageData {
  productId: string;
  storagePath: string;
  sortOrder?: number;
}

export interface ProductFileUpload {
  productId: string;
  file: File;
}

export interface SaveProductFileData {
  productId: string;
  fileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
}

export interface ProductAssets {
  images?: File[];
  digitalFile?: File | null;
}

/* =========================================================
   CONSTANTS
========================================================= */

const IMAGE_BUCKET = "product-covers";
const DIGITAL_FILE_BUCKET = "product-files";

export class StoreSetupRequiredError extends Error {
  constructor() {
    super("Create your store in store settings before creating products.");
    this.name = "StoreSetupRequiredError";
  }
}

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const MAX_DIGITAL_FILE_SIZE =
  50 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_DIGITAL_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
];

/* =========================================================
   1. GENERATE SLUG
========================================================= */

export const generateProductSlug = (
  name: string,
): string => {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/* =========================================================
   2. UNIQUE SLUG
========================================================= */

export const createUniqueProductSlug =
  async (
    name: string,
  ): Promise<string> => {
    const baseSlug =
      generateProductSlug(name);

    if (!baseSlug) {
      throw new Error(
        "Product name cannot generate a valid slug.",
      );
    }

    let slug = baseSlug;
    let counter = 2;

    while (true) {
      const { data, error } =
        await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

      if (error) {
        console.error(
          "Error checking product slug:",
          error,
        );

        throw new Error(
          "Unable to verify product slug.",
        );
      }

      if (!data) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  };

/* =========================================================
   3. VALIDATE
========================================================= */

const validateProductData = (
  product: CreateProductData,
) => {
  if (!product.name.trim()) {
    throw new Error(
      "Product name is required.",
    );
  }

  if (
    !Number.isFinite(product.price) ||
    product.price < 0
  ) {
    throw new Error(
      "Product price must be a valid positive number.",
    );
  }
};

/* =========================================================
   4. CREATE PRODUCT
========================================================= */

export const createProduct = async (
  product: CreateProductData,
) => {
  validateProductData(product);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to create a product.");
  }

  let storeQuery = supabase
    .from("stores")
    .select("id, status")
    .eq("owner_id", user.id);

  if (product.store_id) {
    storeQuery = storeQuery.eq("id", product.store_id);
  }

  const { data: store, error: storeError } =
    await storeQuery.maybeSingle();

  if (storeError) {
    throw new Error(`Unable to verify the product store: ${storeError.message}`);
  }

  if (!store) {
    throw new StoreSetupRequiredError();
  }

  const slug =
    await createUniqueProductSlug(
      product.name,
    );

  /*
   * IMPORTANT:
   * Only send columns confirmed to exist
   * in the current products table.
   */
  const payload = {
    store_id: store.id,
    name: product.name.trim(),

    slug,

    description:
      product.description?.trim() ||
      null,

    category:
      product.category?.trim() ||
      null,

    price: product.price,

    compare_price:
      typeof product.compare_price === "number"
        ? product.compare_price
        : null,

    currency:
      product.currency || "XOF",

    status:
      product.status || "draft",
  };

  const { data, error } =
    await supabase
      .from("products")
      .insert(payload)
      .select()
      .single();

  if (error) {
    console.error(
      "Error creating product:",
      error,
    );

    throw new Error(error.message);
  }

  return data;
};

/* =========================================================
   5. IMAGE VALIDATION
========================================================= */

const validateProductImage = (
  file: File,
) => {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type,
    )
  ) {
    throw new Error(
      "Unsupported image format. Use JPG, PNG, WEBP or GIF.",
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      "Image size must be smaller than 5 MB.",
    );
  }
};

/* =========================================================
   6. UPLOAD PRODUCT IMAGE
========================================================= */

export const uploadProductImage =
  async ({
    productId,
    file,
    sortOrder = 0,
  }: ProductImageUpload) => {
    validateProductImage(file);

    const fileExtension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "jpg";

    const fileName = `${crypto.randomUUID()}.${fileExtension}`;

    const filePath =
      `products/${productId}/${fileName}`;

    const { error } =
      await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType:
              file.type,
          },
        );

    if (error) {
      console.error(
        "Error uploading product image:",
        error,
      );

      throw new Error(
        "Unable to upload product image.",
      );
    }

    return {
      storagePath: filePath,
      sortOrder,
    };
  };

/* =========================================================
   7. SAVE IMAGE DATABASE ROW
========================================================= */

export const saveProductImage =
  async ({
    productId,
    storagePath,
    sortOrder = 0,
  }: SaveProductImageData) => {
    const { data, error } =
      await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          storage_path:
            storagePath,
          sort_order: sortOrder,
        })
        .select()
        .single();

    if (error) {
      console.error(
        "Error saving product image:",
        error,
      );

      throw new Error(
        "Unable to save product image information.",
      );
    }

    return data;
  };

/* =========================================================
   8. DIGITAL FILE VALIDATION
========================================================= */

const validateDigitalFile = (
  file: File,
) => {
  if (
    !ALLOWED_DIGITAL_TYPES.includes(
      file.type,
    )
  ) {
    throw new Error(
      "Unsupported digital file format.",
    );
  }

  if (
    file.size >
    MAX_DIGITAL_FILE_SIZE
  ) {
    throw new Error(
      "Digital file must be smaller than 50 MB.",
    );
  }
};

/* =========================================================
   9. UPLOAD DIGITAL FILE
========================================================= */

export const uploadDigitalFile =
  async ({
    productId,
    file,
  }: ProductFileUpload) => {
    validateDigitalFile(file);

    const fileExtension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() ||
      "bin";

    const fileName = `${crypto.randomUUID()}.${fileExtension}`;

    const filePath =
      `products/${productId}/${fileName}`;

    const { error } =
      await supabase.storage
        .from(DIGITAL_FILE_BUCKET)
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType:
              file.type,
          },
        );

    if (error) {
      console.error(
        "Error uploading digital file:",
        error,
      );

      throw new Error(
        "Unable to upload digital file.",
      );
    }

    return {
      fileName: file.name,
      storagePath: filePath,
      fileSize: file.size,
      mimeType: file.type,
    };
  };

/* =========================================================
   10. SAVE DIGITAL FILE
========================================================= */

export const saveProductFile =
  async ({
    productId,
    fileName,
    storagePath,
    fileSize,
    mimeType,
  }: SaveProductFileData) => {
    const { data, error } =
      await supabase
        .from("product_files")
        .insert({
          product_id: productId,
          file_name: fileName,
          storage_path:
            storagePath,
          file_size: fileSize,
          mime_type: mimeType,
        })
        .select()
        .single();

    if (error) {
      console.error(
        "Error saving product file:",
        error,
      );

      throw new Error(
        "Unable to save product file information.",
      );
    }

    return data;
  };

/* =========================================================
   11. DELETE STORAGE FILE
========================================================= */

const deleteStorageFile =
  async (
    bucket: string,
    storagePath: string,
  ) => {
    const { error } =
      await supabase.storage
        .from(bucket)
        .remove([storagePath]);

    if (error) {
      console.error(
        `Error deleting file from ${bucket}:`,
        error,
      );
    }
  };

/* =========================================================
   12. CREATE PRODUCT WITH ASSETS
========================================================= */

export const createProductWithAssets =
  async (
    product: CreateProductData,
    assets?: ProductAssets,
  ) => {
    let createdProduct: {
      id: string;
      [key: string]: unknown;
    } | null = null;

    const uploadedImagePaths: string[] =
      [];

    const uploadedDigitalPaths: string[] =
      [];

    try {
      /* -----------------------------------------------
         CREATE PRODUCT
      ----------------------------------------------- */

      createdProduct =
        await createProduct(product);

      if (!createdProduct) {
        throw new Error(
          "Unable to create product.",
        );
      }

      /* -----------------------------------------------
         UPLOAD IMAGES
      ----------------------------------------------- */

      if (assets?.images?.length) {
        for (
          let index = 0;
          index <
          assets.images.length;
          index++
        ) {
          const file =
            assets.images[index];

          const uploaded =
            await uploadProductImage({
              productId:
                createdProduct.id,
              file,
              sortOrder: index,
            });

          uploadedImagePaths.push(
            uploaded.storagePath,
          );

          await saveProductImage({
            productId:
              createdProduct.id,
            storagePath:
              uploaded.storagePath,
            sortOrder:
              uploaded.sortOrder,
          });
        }
      }

      /*
       * Digital file upload is intentionally
       * skipped for now because the current
       * products table has no product_type
       * column to distinguish physical/digital.
       */

      /* -----------------------------------------------
         SUCCESS
      ----------------------------------------------- */

      return createdProduct;
    } catch (error) {
      console.error(
        "Error creating product with assets:",
        error,
      );

      /* -----------------------------------------------
         CLEANUP STORAGE
      ----------------------------------------------- */

      for (
        const path of uploadedImagePaths
      ) {
        await deleteStorageFile(
          IMAGE_BUCKET,
          path,
        );
      }

      for (
        const path of uploadedDigitalPaths
      ) {
        await deleteStorageFile(
          DIGITAL_FILE_BUCKET,
          path,
        );
      }

      /* -----------------------------------------------
         CLEANUP DATABASE
      ----------------------------------------------- */

      if (createdProduct) {
        await supabase
          .from("product_images")
          .delete()
          .eq(
            "product_id",
            createdProduct.id,
          );

        await supabase
          .from("product_files")
          .delete()
          .eq(
            "product_id",
            createdProduct.id,
          );

        await supabase
          .from("products")
          .delete()
          .eq(
            "id",
            createdProduct.id,
          );
      }

      throw error;
    }
  };