package com.linxtalk.utils;

import lombok.Builder;
import lombok.Data;

import java.util.List;
@Data
@Builder
public class PageResponse<T> {
    private int pageSize;
    private int pageNumber;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
    private List<T> data;
}
