package com.github.proyeception.benito.controller

import com.github.proyeception.benito.dto.LoginDTO
import com.github.proyeception.benito.service.AuthenticationService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.*
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletResponse

@Controller
open class LoginController(
    private val authenticationService: AuthenticationService
) {
    @RequestMapping(value = ["/benito/author/login"], method = [RequestMethod.POST])
    @ResponseStatus(HttpStatus.OK)
    @CrossOrigin(origins = ["http://localhost:8080"], allowCredentials = "true")
    open fun authorLogin(@RequestBody login: LoginDTO, response: HttpServletResponse) {
        val token = authenticationService.authenticateOrCreateAuthor(login)
        response.addCookie(Cookie(X_QUI_TOKEN, token).also { it.path = "/" })
    }

    @RequestMapping(value = ["/benito/supervisor/login"], method = [RequestMethod.POST])
    @ResponseStatus(HttpStatus.OK)
    @CrossOrigin(origins = ["http://localhost:8080"], allowCredentials = "true")
    open fun supervisorLogin(@RequestBody login: LoginDTO, response: HttpServletResponse) {
        val token = authenticationService.authenticateSupervisor(login)
        response.addCookie(Cookie(X_QUI_TOKEN, token).also { it.path = "/" })
    }

    private companion object {
        private const val X_QUI_TOKEN = "x-qui-token"
    }
}