import { useState, useEffect } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
}

export const usePagination = ({ initialPage = 1, initialPerPage = 12 }: UsePaginationOptions = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);

  const updatePagination = (paginationData: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  }) => {
    setCurrentPage(paginationData.current_page);
    setTotalItems(paginationData.total);
    setPerPage(paginationData.per_page);
    setTotalPages(paginationData.last_page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // Number of pages to show around current page
    
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      pages.push(i);
    }

    if (currentPage - delta > 2) {
      pages.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      pages.push('...');
    }

    pages.unshift(1);
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages.filter((page, index, array) => array.indexOf(page) === index);
  };

  return {
    currentPage,
    perPage,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    updatePagination,
    getPageNumbers,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
