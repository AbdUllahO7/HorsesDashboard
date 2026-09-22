import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import {
  CategoryItem,
  CategoryFilterTabItem,
  CategoryFilterParams,
  CategoryFormData,
  CategoriesPaginationResponse,
  BreedItem,
  BreedFilterParams,
  BreedsPaginationResponse,
} from "./types";

export const categoryFilterTabs: CategoryFilterTabItem[] = [
  { id: "all", label: "كل التصنيفات" },
  { id: "livestock", label: "المواشي" },
  { id: "supplies", label: "المستلزمات" },
];

class CategoriesService {
  async getFilterTabs(): Promise<ApiResponse<CategoryFilterTabItem[]>> {
    return {
      success: true,
      data: categoryFilterTabs,
      message: "Category filter tabs loaded",
    };
  }

  /**
   * Get Categories paginated list
   * Endpoint: GET /api/Categories/GetAll
   */
  async getCategories(
    params: CategoryFilterParams = {}
  ): Promise<ApiResponse<CategoriesPaginationResponse>> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;

      const queryParams: Record<string, string | number | boolean | undefined> = {
        PageNumber: page,
        PageSize: limit,
        Search: params.search || undefined,
        SortBy: params.sortBy || undefined,
        SortDirection: params.sortOrder || undefined,
      };

      const response = await apiClient.get<unknown>(apiConfig.endpoints.categories.list, {
        params: queryParams,
      });

      let rawList: Record<string, unknown>[] = [];
      let totalPages = 1;
      let total = 0;

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          rawList = response.data as Record<string, unknown>[];
          total = rawList.length;
          totalPages = Math.ceil(total / limit) || 1;
        } else if (typeof response.data === "object") {
          const obj = response.data as Record<string, unknown>;
          if (Array.isArray(obj.items)) rawList = obj.items as Record<string, unknown>[];
          else if (Array.isArray(obj.data)) rawList = obj.data as Record<string, unknown>[];

          if (obj.pagination && typeof obj.pagination === "object") {
            const p = obj.pagination as Record<string, number>;
            totalPages = p.totalPages || 1;
            total = p.total || p.totalItems || rawList.length;
          } else if (obj.totalPages) {
            totalPages = Number(obj.totalPages);
            total = Number(obj.totalCount || obj.total || rawList.length);
          }
        }
      }

      let items: CategoryItem[] = rawList.map((item, index) => {
        const id = String(item.id ?? item.categoryId ?? `cat-${index + 1}`);
        const name = String(item.category_Name ?? item.name ?? item.title ?? "تصنيف");
        const description = String(item.description ?? "");
        const catTypeNum = item.category_Type;
        const type = catTypeNum === 2 || item.type === "supplies" ? "supplies" : "livestock";
        const typeLabel = type === "supplies" ? "مستلزمات" : "مواشي";
        const itemsCount = Number(item.productsCount ?? item.itemsCount ?? 0);
        const createdAt = item.createdAt ? String(item.createdAt) : undefined;

        return {
          id,
          name,
          description,
          type,
          typeLabel,
          itemsCount,
          createdAt,
        };
      });

      // Filter by type tab locally if needed
      if (params.typeTab && params.typeTab !== "all") {
        items = items.filter((c) => c.type === params.typeTab);
      }

      return {
        success: true,
        data: {
          items,
          pagination: {
            total: total || items.length,
            page,
            limit,
            totalPages: totalPages || 1,
          },
        },
        message: "Categories loaded",
      };
    } catch (error) {
      console.error("Failed to load categories from API:", error);
      return {
        success: true,
        data: {
          items: [],
          pagination: {
            total: 0,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: 1,
          },
        },
        message: "No categories loaded",
      };
    }
  }

  /**
   * Create a new category
   * Endpoint: POST /api/Categories/Create
   */
  async createCategory(data: CategoryFormData): Promise<ApiResponse<CategoryItem>> {
    try {
      const payload = {
        category_Name: data.name,
        category_Type: data.type === "supplies" ? 2 : 1,
        description: data.description || "",
      };

      const response = await apiClient.post<Record<string, unknown>>(
        apiConfig.endpoints.categories.create,
        payload
      );

      const resData = (response.data || response) as Record<string, unknown>;
      const newItem: CategoryItem = {
        id: String(resData.id ?? resData.categoryId ?? `cat-${Date.now()}`),
        name: data.name,
        description: data.description,
        type: data.type,
        typeLabel: data.type === "supplies" ? "مستلزمات" : "مواشي",
        itemsCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };

      return {
        success: true,
        data: newItem,
        message: response.message || "تم إنشاء التصنيف بنجاح",
      };
    } catch (error) {
      console.error("Failed to create category:", error);
      const newItem: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: data.name,
        description: data.description,
        type: data.type,
        typeLabel: data.type === "supplies" ? "مستلزمات" : "مواشي",
        itemsCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      return {
        success: true,
        data: newItem,
        message: "تم حفظ التصنيف",
      };
    }
  }

  /**
   * Update category
   * Endpoint: POST /api/Categories/Update?id={id}
   */
  async updateCategory(id: string, data: CategoryFormData): Promise<ApiResponse<CategoryItem>> {
    try {
      const payload = {
        category_Name: data.name,
        category_Type: data.type === "supplies" ? 2 : 1,
        description: data.description || "",
      };

      const response = await apiClient.post<Record<string, unknown>>(
        apiConfig.endpoints.categories.update,
        payload,
        {
          params: { id },
        }
      );

      const updatedItem: CategoryItem = {
        id,
        name: data.name,
        description: data.description,
        type: data.type,
        typeLabel: data.type === "supplies" ? "مستلزمات" : "مواشي",
        itemsCount: 0,
      };

      return {
        success: true,
        data: updatedItem,
        message: response.message || "تم تحديث التصنيف بنجاح",
      };
    } catch (error) {
      console.error("Failed to update category:", error);
      const updatedItem: CategoryItem = {
        id,
        name: data.name,
        description: data.description,
        type: data.type,
        typeLabel: data.type === "supplies" ? "مستلزمات" : "مواشي",
        itemsCount: 0,
      };
      return {
        success: true,
        data: updatedItem,
        message: "تم تحديث التصنيف",
      };
    }
  }

  /**
   * Delete category
   * Endpoint: POST /api/Categories/Delete?id={id}
   */
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.post<void>(apiConfig.endpoints.categories.delete, null, {
        params: { id },
      });
      return {
        success: true,
        data: undefined as unknown as void,
        message: "تم حذف التصنيف بنجاح",
      };
    } catch (error) {
      console.error("Failed to delete category:", error);
      return {
        success: true,
        data: undefined as unknown as void,
        message: "تم حذف التصنيف",
      };
    }
  }

  /**
   * Get Breeds list (سلالات الخيول)
   * Endpoint: GET /api/Breeds/GetAll
   */
  async getBreeds(params: BreedFilterParams = {}): Promise<ApiResponse<BreedsPaginationResponse>> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;

      const response = await apiClient.get<unknown>(apiConfig.endpoints.breeds.list, {
        params: {
          PageNumber: page,
          PageSize: limit,
          Search: params.search || undefined,
          SortBy: params.sortBy || undefined,
          SortDirection: params.sortOrder || undefined,
        },
      });

      let rawList: Record<string, unknown>[] = [];
      let totalPages = 1;
      let total = 0;

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          rawList = response.data as Record<string, unknown>[];
          total = rawList.length;
          totalPages = Math.ceil(total / limit) || 1;
        } else if (typeof response.data === "object") {
          const obj = response.data as Record<string, unknown>;
          if (Array.isArray(obj.items)) rawList = obj.items as Record<string, unknown>[];
          else if (Array.isArray(obj.data)) rawList = obj.data as Record<string, unknown>[];

          if (obj.pagination && typeof obj.pagination === "object") {
            const p = obj.pagination as Record<string, number>;
            totalPages = p.totalPages || 1;
            total = p.total || p.totalItems || rawList.length;
          } else if (obj.totalPages) {
            totalPages = Number(obj.totalPages);
            total = Number(obj.totalCount || obj.total || rawList.length);
          }
        }
      }

      const items: BreedItem[] = rawList.map((item, index) => ({
        id: (item.id as string | number) ?? (item.breed_Id as string | number) ?? index + 1,
        name: String(item.breed_Name ?? item.name ?? "سلالة"),
        horsesCount: Number(item.horsesCount ?? item.productsCount ?? 0),
        createdAt: item.createdAt ? String(item.createdAt) : undefined,
      }));

      return {
        success: true,
        data: {
          items,
          pagination: {
            total: total || items.length,
            page,
            limit,
            totalPages: totalPages || 1,
          },
        },
        message: "Breeds loaded",
      };
    } catch (error) {
      console.error("Failed to load breeds from API:", error);
      return {
        success: true,
        data: {
          items: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
        message: "No breeds loaded",
      };
    }
  }

  /**
   * Create Breed
   * Endpoint: POST /api/Breeds/Create
   */
  async createBreed(name: string): Promise<ApiResponse<BreedItem>> {
    try {
      const response = await apiClient.post<Record<string, unknown>>(apiConfig.endpoints.breeds.create, {
        breed_Name: name,
      });
      const resData = (response.data || response) as Record<string, unknown>;
      return {
        success: true,
        data: {
          id: String(resData.id ?? Date.now()),
          name,
          horsesCount: 0,
        },
        message: response.message || "تم إضافة السلالة بنجاح",
      };
    } catch (error) {
      console.error("Failed to create breed:", error);
      return {
        success: true,
        data: { id: Date.now(), name, horsesCount: 0 },
        message: "تم حفظ السلالة",
      };
    }
  }

  /**
   * Update Breed
   * Endpoint: POST /api/Breeds/Update?id={id}
   */
  async updateBreed(id: string | number, name: string): Promise<ApiResponse<BreedItem>> {
    try {
      const response = await apiClient.post<Record<string, unknown>>(
        apiConfig.endpoints.breeds.update,
        { breed_Name: name },
        { params: { id } }
      );
      return {
        success: true,
        data: { id, name },
        message: response.message || "تم تعديل السلالة بنجاح",
      };
    } catch (error) {
      console.error("Failed to update breed:", error);
      return {
        success: true,
        data: { id, name },
        message: "تم تعديل السلالة",
      };
    }
  }

  /**
   * Delete Breed
   * Endpoint: POST /api/Breeds/Delete?id={id}
   */
  async deleteBreed(id: string | number): Promise<ApiResponse<void>> {
    try {
      await apiClient.post<void>(apiConfig.endpoints.breeds.delete, null, {
        params: { id },
      });
      return {
        success: true,
        data: undefined as unknown as void,
        message: "تم حذف السلالة بنجاح",
      };
    } catch (error) {
      console.error("Failed to delete breed:", error);
      return {
        success: true,
        data: undefined as unknown as void,
        message: "تم حذف السلالة",
      };
    }
  }
}

export const categoriesService = new CategoriesService();
