package com.github.proyeception.benito.oauth

import arrow.core.right
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.github.proyeception.benito.Spec
import com.github.proyeception.benito.connector.OAuthConnector
import com.github.proyeception.benito.connector.Response
import com.github.proyeception.benito.dto.FileCreatedDTO
import com.github.proyeception.benito.dto.FileDTO
import com.github.proyeception.benito.dto.MetadataDTO
import com.github.proyeception.benito.mock.eq
import com.github.proyeception.benito.mock.getMock
import com.github.proyeception.benito.mock.on
import com.nhaarman.mockito_kotlin.anyVararg
import io.kotlintest.matchers.shouldBe
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.verify
import org.springframework.web.multipart.MultipartFile

class GoogleDriveClientTest : Spec() {
    init {
        val mapperMock: ObjectMapper = getMock()
        val connectorMock: OAuthConnector = getMock()
        val googleDriveClient = GoogleDriveClient(
            objectMapper = mapperMock,
            googleDriveConnector = connectorMock
        )

        "getFile" should {
            "retrieve the fileId asking for webContentLink, mimeType and name of the file" {
                val responseMock: Response = getMock()
                on(connectorMock.get(anyString())).thenReturn(responseMock.right())
                on(responseMock.deserializeAs(any(TypeReference::class.java))).thenReturn(
                    FileDTO(
                        id = "123",
                        name = "some name",
                        mimeType = "application/pdf",
                        webContentLink = null
                    )
                )

                val expected = FileDTO(
                    id = "123",
                    name = "some name",
                    mimeType = "application/pdf",
                    webContentLink = null
                ).right()

                val actual = googleDriveClient.getFile("123")

                actual shouldBe expected

                verify(connectorMock).get(
                    eq("https://www.googleapis.com/drive/v3/files/123?fields=webContentLink,name,mimeType")
                )
            }
        }

        "createFile" should {
            "make a POST to the API with the file" {
                val metadataBytes = ByteArray(60)
                val responseMock: Response = getMock()
                on(mapperMock.writeValueAsBytes(any(MetadataDTO::class.java))).thenReturn(metadataBytes)
                on(connectorMock.post(
                    anyString(),
                    anyVararg()
                )).thenReturn(responseMock.right())
                on(responseMock.deserializeAs(any(TypeReference::class.java))).thenReturn(
                    FileCreatedDTO(
                        id = "123",
                        name = "some-file",
                        mimeType = "application/pdf"
                    )
                )
                val multipartMock: MultipartFile = getMock()
                val multipartBytes = ByteArray(70)
                on(multipartMock.bytes).thenReturn(multipartBytes)

                val expected = FileCreatedDTO(
                    id = "123",
                    name = "some-file",
                    mimeType = "application/pdf"
                ).right()

                val actual = googleDriveClient.createFile("123", multipartMock, "456")

                actual shouldBe expected

                verify(connectorMock).post(
                    eq("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"),
                    eq(Pair("application/json", metadataBytes)),
                    eq(Pair("multipart/form-data", multipartBytes))
                )
            }
        }

        "createFolder" should {
            "make a POST to the API with no file" {
                val metadataBytes = ByteArray(60)
                val responseMock: Response = getMock()
                on(mapperMock.writeValueAsBytes(any(MetadataDTO::class.java))).thenReturn(metadataBytes)
                on(connectorMock.post(
                    anyString(),
                    anyVararg()
                )).thenReturn(responseMock.right())
                on(responseMock.deserializeAs(any(TypeReference::class.java))).thenReturn(
                    FileCreatedDTO(
                        id = "123",
                        name = "some-file",
                        mimeType = "application/pdf"
                    )
                )

                val expected = FileCreatedDTO(
                    id = "123",
                    name = "some-file",
                    mimeType = "application/pdf"
                ).right()

                val actual = googleDriveClient.createFolder("folder")

                actual shouldBe expected

                verify(connectorMock).post(
                    eq("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"),
                    eq(Pair("application/json", metadataBytes))
                )
            }
        }
    }
}