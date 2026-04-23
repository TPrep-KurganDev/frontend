import {AppRoute} from '../const';

export const BACK_PAGE_PARAM = 'backPage';

type RouteLocation = {
  pathname: string;
  search: string;
};

function normalizeParamValue(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeBackPage(value: string | null | undefined): string | null {
  const normalized = normalizeParamValue(value);
  if (!normalized) {
    return null;
  }

  if (!normalized.startsWith('/') || normalized.startsWith('//')) {
    return null;
  }

  return normalized;
}

function buildPath(pathname: string, params: Record<string, string | number | null | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const normalized = normalizeParamValue(value);
    if (!normalized) {
      return;
    }

    searchParams.set(key, normalized);
  });

  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function getBackPage(searchParams: URLSearchParams, fallback: string = AppRoute.Main): string {
  return normalizeBackPage(searchParams.get(BACK_PAGE_PARAM)) ?? fallback;
}

export function getCurrentLocationPath(location: RouteLocation): string {
  return `${location.pathname}${location.search}`;
}

export function buildExamCoverPath(
  examId: string | number | null | undefined,
  backPage?: string | null
): string {
  return buildPath(AppRoute.ExamCover, {
    examId,
    [BACK_PAGE_PARAM]: backPage
  });
}

export function buildExamPath(
  examId: string | number | null | undefined,
  backPage?: string | null
): string {
  return buildPath(AppRoute.Exam, {
    examId,
    [BACK_PAGE_PARAM]: backPage
  });
}

export function buildCardEditPath(
  cardId: string | number | null | undefined,
  examId: string | number | null | undefined,
  backPage?: string | null
): string {
  return buildPath(AppRoute.CardEdit, {
    cardId,
    examId,
    [BACK_PAGE_PARAM]: backPage
  });
}

export function buildFileUploadPath(
  examId: string | number | null | undefined,
  backPage?: string | null
): string {
  return buildPath(AppRoute.FileUpload, {
    examId,
    [BACK_PAGE_PARAM]: backPage
  });
}
