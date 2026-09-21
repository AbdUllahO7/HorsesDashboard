import { ApiResponse } from "@/types/api";
import {
  CategoryItem,
  CategoryFilterTabItem,
  CategoryFilterParams,
  CategoryFormData,
  CategoriesPaginationResponse,
} from "./types";

export const categoryFilterTabs: CategoryFilterTabItem[] = [
  { id: "all", label: "كل التصنيفات" },
  { id: "livestock", label: "المواشي" },
  { id: "supplies", label: "المستلزمات" },
];

export const mockCategoriesList: CategoryItem[] = [
  {
    id: "cat-1",
    name: "غنم نعيم",
    description: "سلالة الغنم النعيم الأصيلة",
    type: "livestock",
    typeLabel: "مواشي",
    itemsCount: 142,
  },
  {
    id: "cat-2",
    name: "غنم نعيم",
    description: "سلالة الغنم النعيم الأصيلة",
    type: "livestock",
    typeLabel: "مواشي",
    itemsCount: 142,
  },
  {
    id: "cat-3",
    name: "غنم نعيم",
    description: "سلالة الغنم النعيم الأصيلة",
    type: "supplies",
    typeLabel: "مستلزمات",
    itemsCount: 142,
  },
  {
    id: "cat-4",
    name: "غنم نعيم",
    description: "سلالة الغنم النعيم الأصيلة",
    type: "livestock",
    typeLabel: "مواشي",
    itemsCount: 142,
  },
  {
    id: "cat-5",
    name: "غنم نعيم",
    description: "سلالة الغنم النعيم الأصيلة",
    type: "livestock",
    typeLabel: "مواشي",
    itemsCount: 142,
  },
  {
    id: "cat-6",
    name: "غنم نعيم",
    description: "سلالة الغنم النعيم الأصيلة",
    type: "supplies",
    typeLabel: "مستلزمات",
    itemsCount: 142,
  },
  {
    id: "cat-7",
    name: "غنم نعيم",
    description: "سلالة الغنم النعيم الأصيلة",
    type: "livestock",
    typeLabel: "مواشي",
    itemsCount: 142,
  },
  {
    id: "cat-8",
    name: "غنم نعيم",
    description: "سلالة الغنم النعيم الأصيلة",
    type: "livestock",
    typeLabel: "مواشي",
    itemsCount: 142,
  },
];

class CategoriesService {
  async getFilterTabs(): Promise<ApiResponse<CategoryFilterTabItem[]>> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return {
      success: true,
      data: categoryFilterTabs,
    };
  }

  async getCategories(
    params: CategoryFilterParams = {}
  ): Promise<ApiResponse<CategoriesPaginationResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    let filtered = [...mockCategoriesList];

    // Filter by type
    if (params.typeTab && params.typeTab !== "all") {
      filtered = filtered.filter((c) => c.type === params.typeTab);
    }

    // Filter by search
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.typeLabel.toLowerCase().includes(q)
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 4;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        items: items.length > 0 ? items : filtered,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    };
  }

  async createCategory(data: CategoryFormData): Promise<ApiResponse<CategoryItem>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const newItem: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: data.name,
      description: data.description,
      type: data.type,
      typeLabel: data.type === "livestock" ? "مواشي" : "مستلزمات",
      itemsCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    mockCategoriesList.unshift(newItem);
    return {
      success: true,
      data: newItem,
      message: "تم إنشاء التصنيف بنجاح",
    };
  }

  async updateCategory(
    id: string,
    data: Partial<CategoryFormData>
  ): Promise<ApiResponse<CategoryItem>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = mockCategoriesList.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, message: "Category not found", data: null as any };
    }
    const updated = {
      ...mockCategoriesList[index],
      ...data,
      typeLabel:
        data.type === "livestock"
          ? "مواشي"
          : data.type === "supplies"
          ? "مستلزمات"
          : mockCategoriesList[index].typeLabel,
    };
    mockCategoriesList[index] = updated;
    return {
      success: true,
      data: updated,
      message: "تم تحديث التصنيف بنجاح",
    };
  }

  async deleteCategory(id: string): Promise<ApiResponse<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = mockCategoriesList.findIndex((c) => c.id === id);
    if (index !== -1) {
      mockCategoriesList.splice(index, 1);
    }
    return {
      success: true,
      data: true,
      message: "تم حذف التصنيف بنجاح",
    };
  }
}

export const categoriesService = new CategoriesService();
