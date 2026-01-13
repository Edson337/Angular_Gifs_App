import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interfaces';
import { GifMapper } from '../mapper/gif.mapper';

@Injectable({providedIn: 'root'})
export class GifsService {
    private http = inject(HttpClient);
    trendingGifs = signal<Gif[]>([]);

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
            console.log(gifs);
        });
    }
}