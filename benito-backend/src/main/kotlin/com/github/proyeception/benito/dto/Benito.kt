package com.github.proyeception.benito.dto

import java.time.LocalDate

data class ErrorDTO(
    val status: Int,
    val message: String?,
    val stackTrace: List<String>?
)

enum class OrderDTO(val sortMethod: String) {
    DATE_ASC("creation_date:ASC"),
    DATE_DESC("creation_date:DESC"),
    ALPHA_ASC("title:ASC"),
    ALPHA_DESC("title:DESC"),
}

data class CountDTO(
    val total: Int
)

data class ProjectDTO(
    val id: String,
    val title: String,
    val description: String,
    val extraContent: String,
    val creationDate: LocalDate,
    val posterUrl: String,
    val authors: List<PersonRefDTO>,
    val supervisors: List<PersonRefDTO>,
    val tags: List<String>,
    val documentation: List<DocumentationDTO>
) {
    constructor(medusaProjectDTO: MedusaProjectDTO) : this(
        id = medusaProjectDTO.id,
        title = medusaProjectDTO.title,
        description = medusaProjectDTO.description,
        extraContent = medusaProjectDTO.extraContent.orEmpty(),
        creationDate = medusaProjectDTO.creationDate,
        posterUrl = medusaProjectDTO.poster.url,
        authors = medusaProjectDTO.authors,
        supervisors = medusaProjectDTO.supervisors,
        tags = emptyList(),
        documentation = medusaProjectDTO.documentation
    )
}

data class PersonDTO(
    val username: String,
    val fullName: String,
    val organizations: List<OrganizationDTO>,
    val profilePicUrl: String?,
    val projects: List<ProjectRefDTO>
) {
    constructor(medusa: MedusaPersonDTO) : this(
        username = medusa.username,
        fullName = medusa.fullName,
        organizations = medusa.organizations,
        profilePicUrl = medusa.profilePic?.url,
        projects = medusa.projects
    )
}
