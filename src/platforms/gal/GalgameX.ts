import { fetchClient } from "../../utils/httpClient";
import type {
  Platform,
  PlatformSearchResult,
  SearchResultItem,
} from "../../types";

const API_URL = "https://www.galgamex.net/api/games";
const GAME_URL = "https://www.galgamex.net/game/";

interface GalgameXItem {
  name: string;
  uniqueId: string;
}

interface GalgameXResponse {
  data?: {
    games?: GalgameXItem[];
    total?: number;
  };
  error?: string | null;
  message?: string | null;
}

async function searchGalgameX(
  game: string,
): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const params = new URLSearchParams({
      title: game,
      pageSize: "24",
      pageIndex: "1",
      sortBy: "resource_updated",
    });

    const response = await fetchClient(`${API_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `资源平台 GamesAPI 响应异常状态码 ${response.status}`,
      );
    }

    const data = (await response.json()) as GalgameXResponse;

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.data || !Array.isArray(data.data.games)) {
      throw new Error("资源平台 GamesAPI 响应格式异常");
    }

    const items: SearchResultItem[] = data.data.games
      .filter(
        (item) =>
          typeof item.name === "string" &&
          item.name.trim().length > 0 &&
          typeof item.uniqueId === "string" &&
          item.uniqueId.length > 0,
      )
      .map((item) => ({
        name: item.name.trim(),
        url: `${GAME_URL}${encodeURIComponent(item.uniqueId)}`,
      }));

    searchResult.items = items;
    searchResult.count = items.length;
  } catch (error) {
    searchResult.error =
      error instanceof Error
        ? error.message
        : "An unknown error occurred";
    searchResult.count = -1;
  }

  return searchResult;
}

const GalgameX: Platform = {
  name: "Galgamex",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchGalgameX,
};

export default GalgameX;
