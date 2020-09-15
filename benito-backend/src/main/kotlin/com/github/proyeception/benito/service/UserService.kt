package com.github.proyeception.benito.service

import com.github.proyeception.benito.client.MedusaClient
import com.github.proyeception.benito.dto.*
import com.github.proyeception.benito.exception.AmbiguousReferenceException
import org.apache.http.entity.ContentType
import org.slf4j.LoggerFactory
import org.springframework.web.multipart.MultipartFile

open class UserService(
    private val medusaClient: MedusaClient,
    private val organizationService: OrganizationService,
    private val fileService: FileService
) {
    open fun findAuthor(userId: String): PersonDTO = findUserById(userId, UserType.AUTHOR)

    open fun findSupervisor(userId: String): PersonDTO = findUserById(userId, UserType.SUPERVISOR)

    open fun findSupervisorByGoogleId(id: String): PersonDTO? = findUserByGoogleId(id, UserType.SUPERVISOR)

    open fun findAuthorByGoogleId(id: String): PersonDTO? = findUserByGoogleId(id, UserType.AUTHOR)

    open fun findSupervisorByEmail(mail: String): PersonDTO? = findOneUserBy(
        UserType.SUPERVISOR,
        Pair("mail", mail)
    )

    open fun createAuthor(
        username: String?,
        fullName: String,
        mail: String,
        googleUserId: String,
        googleToken: String,
        profilePicUrl: String?
    ): PersonDTO {
        val image = createImageFromUrl(googleUserId, profilePicUrl)

        val person = CreateMedusaPersonDTO(
            fullName = fullName,
            username = username,
            mail = mail,
            googleUserId = googleUserId,
            profilePic = image,
            googleToken = googleToken
        )

        return mapMedusaToDomain(medusaClient.createUser(person, UserType.AUTHOR))
    }

    fun updateAuthorProfilePicture(id: String, image: MultipartFile) = updateUserProfilePicture(
        id = id,
        image = image,
        userType = UserType.AUTHOR
    ).let { mapMedusaToDomain(it) }

    fun updateSupervisorProfilePicture(id: String, image: MultipartFile) = updateUserProfilePicture(
        id = id,
        image = image,
        userType = UserType.SUPERVISOR
    ).let { mapMedusaToDomain(it) }

    fun updateAuthor(id: String, user: UpdateUserDTO) = updateUser(
        id = id,
        user = user,
        userType = UserType.AUTHOR
    )

    fun updateSupervisor(id: String, user: UpdateUserDTO) = updateUser(
        id = id,
        user = user,
        userType = UserType.SUPERVISOR
    )

    private fun findOneUserBy(userType: UserType, vararg filters: Pair<String, String>): PersonDTO? = medusaClient
        .findUsersBy(
            userType,
            *filters
        )
        .let {
            when (it.size) {
                0 -> null
                1 -> mapMedusaToDomain(it.first())
                else -> {
                    LOGGER.error("Ambiguous filter $filters")
                    throw AmbiguousReferenceException("Ambiguous filter")
                }
            }
        }

    private fun findUserByGoogleId(id: String, userType: UserType): PersonDTO? = findOneUserBy(
        userType,
        Pair("google_user_id", id)
    )

    private fun findUserById(userId: String, userType: UserType) = mapMedusaToDomain(
        medusaClient.findUser(
            userId,
            userType
        )
    )

    private fun createImageFromUrl(userId: String, profilePicUrl: String?): MedusaFileDTO? = profilePicUrl?.let {
        fileService.createMedusaFileFromUrl(
            url = it,
            filePath = "/tmp/$userId.jpg",
            fileName = "$userId.jpg",
            contentType = ContentType.IMAGE_JPEG
        )
    }
        ?.also { LOGGER.info("Created image with id ${it.id} on medusa") }

    private fun mapIdToOrganization(organizationId: String): OrganizationDTO = organizationService
        .find(organizationId)

    private fun mapMedusaToDomain(medusa: MedusaPersonDTO): PersonDTO = PersonDTO(
        id = medusa.id,
        username = medusa.username,
        fullName = medusa.fullName,
        organizations = medusa.organizations.map { OrganizationDTO(it) },
        profilePicUrl = medusa.profilePic?.url,
        projects = medusa.projects.map {
            ProjectRefDTO(
                id = it.id,
                title = it.title,
                posterUrl = it.poster?.url,
                organization = mapIdToOrganization(it.organizationId),
                description = it.description
            )
        },
        socials = medusa.socials,
        contact = ContactDTO(
            mail = medusa.mail,
            phone = medusa.mail
        )
    )

    private fun updateUserProfilePicture(id: String, image: MultipartFile, userType: UserType): MedusaPersonDTO {
        val file = fileService.createMedusaFileFromUpload(
            multipart = image,
            contentType = ContentType.getByMimeType(image.contentType),
            fileName = image.originalFilename ?: "$id.jpg",
            filePath = "/tmp/$id.jpg"
        )
        return medusaClient.updateUserProfilePicture(
            userId = id,
            userType = userType,
            profilePic = UpdateProfilePictureDTO(profilePic = file)
        )
            .also {
                LOGGER.info("Successfully updated $userType $id profile picture")
            }
    }

    private fun updateUser(id: String, user: UpdateUserDTO, userType: UserType) = medusaClient.updateUser(
        userId = id,
        user = user,
        userType = userType
    ).let { mapMedusaToDomain(it) }

    companion object {
        private val LOGGER = LoggerFactory.getLogger(UserService::class.java)
    }
}