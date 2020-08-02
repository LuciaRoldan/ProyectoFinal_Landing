package com.github.proyeception.benito.controller

import com.github.proyeception.benito.dto.CategoryDTO
import com.github.proyeception.benito.service.CategoriesService
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.ResponseBody

@Controller
open class CategoriesController(
    private val categoriesService: CategoriesService
) {
    @RequestMapping("/benito/categories", method = [RequestMethod.GET])
    @ResponseBody
    @CrossOrigin
    open fun categories(): List<CategoryDTO> = categoriesService.categories()
}