package com.github.proyeception.benito.controller

import com.github.proyeception.benito.dto.CountDTO
import com.github.proyeception.benito.dto.OrderDTO
import com.github.proyeception.benito.dto.ProjectDTO
import com.github.proyeception.benito.service.ProjectService
import com.github.proyeception.benito.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile


@Controller
class ProjectController(
    private val projectService: ProjectService,
    private val userService: UserService
) {

    @RequestMapping("/benito/projects", method = [RequestMethod.GET])
    @ResponseBody
    @CrossOrigin
    private fun findProjects(
        @RequestParam(required = false) orderBy: OrderDTO?,
        @RequestParam(required = false) from: String?,
        @RequestParam(required = false) to: String?,
        @RequestParam(required = false, name = "name") nameContains: String?,
        @RequestParam(required = false, name = "category") category: String?
    ): List<ProjectDTO> {
        return projectService.findProjects(orderBy, from, to, nameContains, category)
    }

    @RequestMapping("/benito/projects/featured", method = [RequestMethod.GET])
    @ResponseBody
    @CrossOrigin
    private fun top10Projects(): List<ProjectDTO> = projectService.top10Projects()

    @RequestMapping("/benito/project-count", method = [RequestMethod.GET])
    @ResponseBody
    @CrossOrigin
    private fun count(): CountDTO = projectService.count()

    @RequestMapping("/benito/projects/{id}", method = [RequestMethod.GET])
    @ResponseBody
    @CrossOrigin
    private fun findProjects(@PathVariable id: String): ProjectDTO = projectService.findProject(id)

    @RequestMapping(
        value = ["/benito/projects/{projectId}/documents"],
        method = [RequestMethod.POST],
        consumes = [MediaType.MULTIPART_FORM_DATA_VALUE]
    )
    @ResponseBody
    @CrossOrigin
    @ResponseStatus(value = HttpStatus.OK)
    private fun saveFile(
        @PathVariable projectId: String,
        @RequestParam name: String,
        @RequestParam("file") file: MultipartFile
    ) = projectService.saveFile(projectId, name, file)

    @RequestMapping(value = ["/benito/authors/{id}"], method = [RequestMethod.GET])
    @ResponseBody
    @CrossOrigin
    fun findAuthor(@PathVariable id: String) = userService.findAuthor(id)

    @RequestMapping(value = ["/benito/supervisors/{id}"], method = [RequestMethod.GET])
    @ResponseBody
    @CrossOrigin
    fun findSupervisor(@PathVariable id: String) = userService.findSupervisor(id)
}
