package com.linxtalk.utils;

import lombok.Builder;

@Builder
public class PageResponse<T> {
    private int pageSize;
    private int pageNumber;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
    private T[] data;
}
