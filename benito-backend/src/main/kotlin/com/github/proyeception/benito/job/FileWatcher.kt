package com.github.proyeception.benito.job

import com.github.proyeception.benito.extension.launchIOAsync
import com.github.proyeception.benito.oauth.GoogleDriveClient
import com.github.proyeception.benito.observer.FileObserver
import com.github.proyeception.benito.storage.Drive
import com.github.proyeception.benito.storage.DriveStorage
import kotlinx.coroutines.delay
import org.slf4j.LoggerFactory
import java.time.LocalDateTime

class FileWatcher(
    private val googleDriveClient: GoogleDriveClient,
    private val fileObserver: FileObserver,
    private val refreshRate: Int, // in seconds
    driveStorage: DriveStorage
) {
    private val driveFolders = mutableListOf<Drive>()
    private var lastNotification = LocalDateTime.now()

    init {
        driveStorage.findOpen().forEach { driveFolders.add(it) }
        launchIOAsync {
            while (true) {
                poll()
                delay(refreshRate.toLong() * 1000)
            }
        }
    }

    fun watch(drive: Drive) {
        driveFolders.add(drive)
    }

    fun unwatch(driveFolderId: String) {
        driveFolders.removeIf { it.driveFolderId == driveFolderId }
    }

    private fun poll() {
        LOGGER.info("Polling for file changes...")
        driveFolders.forEach {
            googleDriveClient
                .getFile(fileId = it.driveFolderId)
                .fold(
                    ifLeft = { e -> LOGGER.warn("Failed to retrieve file $it", e) },
                    ifRight = { f ->
                        if (f.modifiedTime.isAfter(lastNotification)) {
                            LOGGER.info("File ${f.name} was updated")
                            fileObserver.notify(
                                f,
                                it.projectId,
                                lastNotification
                            )
                        }
                    }
                )
        }
        LOGGER.info("Done. Will check again in $refreshRate seconds")
    }

    companion object {
        private val LOGGER = LoggerFactory.getLogger(FileWatcher::class.java)
    }
}