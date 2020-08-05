package com.github.proyeception.benito.service

import com.github.proyeception.benito.client.MedusaClient
import com.github.proyeception.benito.dto.OrderDTO
import com.github.proyeception.benito.dto.ProjectCountDTO
import com.github.proyeception.benito.dto.ProjectDTO

open class ProjectService(
    private val medusaClient: MedusaClient
) {
    open fun findProjects(
        orderBy: OrderDTO?,
        from: String?,
        to: String?,
        nameContains: String?,
        category: String?
    ): List<ProjectDTO> {
        return medusaClient.getProjects(orderBy, from, to, nameContains, category).map { ProjectDTO(it) }
    }

    fun top10Projects(): List<ProjectDTO> {
        return medusaClient.top10Projects().map { ProjectDTO(it) }
    }

    fun count(): ProjectCountDTO = ProjectCountDTO(medusaClient.count())
}