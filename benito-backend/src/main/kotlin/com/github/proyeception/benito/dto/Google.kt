package com.github.proyeception.benito.dto

data class GoogleFileDTO(
    val id: String,
    val name: String,
    val mimeType: String,
    val webContentLink: String?
)

data class FileCreatedDTO(
    val id: String,
    val name: String,
    val mimeType: String
) {
    fun toFile(): GoogleFileDTO = GoogleFileDTO(
        name = name,
        mimeType = mimeType,
        webContentLink = null,
        id = id
    )
}

data class MetadataDTO(
    val name: String,
    val mimeType: String? = null,
    val parents: List<String>? = null
)

data class QueryDTO(
    val files: List<GoogleFileDTO>
)

data class GoogleProfileEmailDTO(
    val value: String
)

data class GoogleProfilePhotoDTO(
    val url: String
)

data class GoogleProfileNameDTO(
    val displayName: String
)

data class GoogleProfileMetadataSourceDTO(
    val id: String
)

data class GoogleProfileMetadataDTO(
    val sources: List<GoogleProfileMetadataSourceDTO>
)

data class GoogleProfileDTO(
    val emailAddresses: List<GoogleProfileEmailDTO>,
    val photos: List<GoogleProfilePhotoDTO>,
    val names: List<GoogleProfileNameDTO>,
    val metadata: GoogleProfileMetadataDTO
)

data class CreateFolderDTO(
    val name: String,
    val mimeType: String = "application/vnd.google-apps.folder"
)

data class CreatePermissionDTO(
    val role: String,
    val type: String
)
