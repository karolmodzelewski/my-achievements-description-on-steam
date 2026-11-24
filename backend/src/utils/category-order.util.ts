import { CategoryKind } from '../enums/category-kind.enum';

interface OrderedCategory {
    kind: CategoryKind;
    position: number;
}

const CATEGORY_KINDS_ORDER = Object.values(CategoryKind);

// Orders categories from the first main category to the last difficulty category
export const compareCategories = (a: OrderedCategory, b: OrderedCategory): number => CATEGORY_KINDS_ORDER.indexOf(a.kind) - CATEGORY_KINDS_ORDER.indexOf(b.kind) || a.position - b.position;
