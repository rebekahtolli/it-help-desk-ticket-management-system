package com.helpdesk.helpdesk_backend.repository;

import com.helpdesk.helpdesk_backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}