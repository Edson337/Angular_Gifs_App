import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interfaces';
import { GifMapper } from '../mapper/gif.mapper';

@Injectable({providedIn: 'root'})
export class GifsService {
    private http = inject(HttpClient);
    trendingGifs = signal<Gif[]>([]);
    trendingGifsLoading = signal(true);
    searchHistory = signal<Record<string, Gif[]>>({});
    searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

    constructor() {
        this.loadTrendingGifs();
    }

    loadTrendingGifs () {
        this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
            params: {
                api_key: environment.giphyApikey,
                limit: 25,
            }
        }).subscribe( (response) => {
            const gifs = GifMapper.mapGiphyItemsToGifArray(response.data);
            this.trendingGifs.set(gifs);
            this.trendingGifsLoading.set(false);
        });
    }

    searchGifs(query: string) {
        return this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
            params: {
                api_key: environment.giphyApikey,
                q: query,
                limit: 25,
            }
        }).pipe(
            map(({data}) => data),
            map((items) => GifMapper.mapGiphyItemsToGifArray(items)),
            tap((items) => {
                this.searchHistory.update((history) => ({
                    ... history,
                    [query.toLowerCase()]: items
                }))
            })
        );
    }
}