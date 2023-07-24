import axios, { AxiosInstance } from "axios";

export interface BingSearchResponse {
  _type: string;
  queryContext: {
    originalQuery: string;
  };
  webPages: {
    webSearchUrl: string;
    totalEstimatedMatches: number;
    value: {
      id: string;
      name: string;
      url: string;
      displayUrl: string;
      snippet: string;
      dateLastCrawled: string;
      language: string;
      isNavigational: boolean;
    }[];
  };
  relatedSearches: {
    id: string;
    value: {
      text: string;
      displayText: string;
      webSearchUrl: string;
    }[];
  };
  rankingResponse: {
    mainline: {
      items: {
        answerType: string;
        resultIndex: number;
        value: {
          id: string;
          name: string;
          url: string;
          displayUrl: string;
          snippet: string;
          deepLinks: {
            name: string;
            url: string;
            snippet: string;
            dateLastCrawled: string;
            language: string;
          }[];
        };
      }[];
    };
    sidebar: {
      items: {
        answerType: string;
        value: {
          id: string;
        };
      }[];
    };
  };
  videos: {
    id: string;
    readLink: string;
    webSearchUrl: string;
    isFamilyFriendly: boolean;
    value: {
      name: string;
      description: string;
      webSearchUrl: string;
      thumbnailUrl: string;
      datePublished: string;
      publisher: {
        name: string;
      };
      creator: {
        name: string;
      };
      contentUrl: string;
      hostPageUrl: string;
      encodingFormat: string;
      hostPageDisplayUrl: string;
      width: number;
      height: number;
      duration: string;
      motionThumbnailUrl: string;
      embedHtml: string;
      allowHttpsEmbed: boolean;
      viewCount: number;
      thumbnail: {
        width: number;
        height: number;
      };
      videoId: string;
    }[];
  };
  entities: {
    value: {
      id: string;
      name: string;
      url: string;
      description: string;
      bingId: string;
      contractualRules: {
        _type: string;
        targetPropertyName: string;
        mustBeCloseToContent: boolean;
        license: {
          name: string;
          url: string;
        };
      }[];
    }[];
  };
  news: {
    id: string;
    readLink: string;
    value: {
      name: string;
      url: string;
      image: {
        thumbnail: {
          contentUrl: string;
          width: number;
          height: number;
        };
      };
      description: string;
      about: {
        readLink: string;
        name: string;
      }[];
      provider: {
        _type: string;
        name: string;
      }[];
      datePublished: string;
      category: string;
      headline: string;
    }[];
  };
}

export interface ErrorResult {
  error: string;
}

export class BingInstance {
  private axios: AxiosInstance;

  public constructor(config: { apiKey: string }) {
    this.axios = axios.create({
      baseURL: "https://api.bing.microsoft.com/v7.0/",
      headers: {
        "Ocp-Apim-Subscription-Key": config.apiKey,
      },
    });
  }

  public async search(
    query: string
  ): Promise<BingSearchResponse | ErrorResult> {
    try {
      const searchResponse = await this.axios.get<BingSearchResponse>(
        "search?q=" + encodeURIComponent(query)
      );

      return searchResponse.data;
    } catch (err: any | Error) {
      return {
        error:
          "Error: " + err?.response?.data?.error?.message ?? "Unknown error",
      };
    }
  }

  public async searchSmall(
    query: string
  ): Promise<Partial<BingSearchResponse | ErrorResult>> {
    const response = (await this.search(query)) as BingSearchResponse;
    return {
      _type: response._type,
      queryContext: response.queryContext,
      webPages: response.webPages,
      news: response.news,
    };
  }
}
