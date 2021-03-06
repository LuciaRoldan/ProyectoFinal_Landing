import {
  Button,
  CircularProgress,
  createMuiTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Hidden,
  Icon,
  makeStyles,
  Popover,
  TextField,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
import React, { useCallback, useState } from "react";
import { hot } from "react-hot-loader";
import { Redirect, RouteComponentProps, withRouter } from "react-router-dom";
import styles from "../../assets/jss/material-kit-react/views/editProject";
import Footer from "../../components/Footer/Footer";
import GridContainer from "../../components/Grid/GridContainer";
import GridItem from "../../components/Grid/GridItem";
import Header from "../../components/Header/Header";
import HeaderLinks from "../../components/Header/HeaderLinks";
import Parallax from "../../components/Parallax/Parallax";
import Spinner from "../../components/Spinner/Spinner";
import { ERROR, PENDING } from "../../hooks/withFetch";
import withProject from "../../hooks/withProject";
import { RemoveCircle, AddCircle } from "@material-ui/icons";
import {
  Documentation,
  Organization,
  Person,
  Project,
  ProjectEditionRole,
} from "../../types";
import { SessionState } from "../../store/session/types";
import { RootState } from "../../reducers";
import { connect } from "react-redux";
import ImageUploader from "react-images-upload";
import { useDropzone } from "react-dropzone";
import classNames from "classnames";
import CustomButton from "../../components/CustomButtons/Button";
import { fetchOrganization } from "../../functions/organization";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  generateTagsFromText,
  setProjectUsers,
  updateContent,
  updatePicture,
  updateTags,
  uploadDocuments,
  generatePdfUrl,
} from "../../functions/project";
import useCreateGhostUser from "../../components/CreateGhostUser/CreateGhostUser";
import { grey, red } from "@material-ui/core/colors";
import MEDitor, { commands } from "@uiw/react-md-editor";
import CreateGhostUser from "../../components/CreateGhostUser/CreateGhostUser";
import FilePreview from "react-preview-file/dist/filePreview";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { CSSTransition } from "react-transition-group";
import spinner from "../../assets/img/proyectate/spinner.gif";
import { Helmet } from "react-helmet";

const useStyles = makeStyles(styles);

type MatchParams = {
  id: string;
};

interface Change {
  undo: () => void;
  render: () => React.ReactNode;
}

interface EditProjectPageProps extends RouteComponentProps<MatchParams> {
  session: SessionState;
  loading: boolean;
}

const EditProjectPage = (props: EditProjectPageProps) => {
  const classes = useStyles();
  const { ...rest } = props;

  const [initialTitle, setInitialTitle] = useState("");
  const [initialDescription, setInitialDescription] = useState("");
  const [initialReadme, setInitialReadme] = useState("");

  const [title, setTitle] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [readme, setReadme] = useState<string | undefined>();
  const [authorsToAdd, setAuthorsToAdd] = useState<Array<Person>>([]);
  const [authorsToRemove, setAuthorsToRemove] = useState<Array<Person>>([]);
  const [supervisorsToAdd, setSupervisorsToAdd] = useState<Array<Person>>([]);
  const [pdfPicture, setPdfPicture] = useState<File | undefined>();
  const [pictureUrl, setPictureUrl] = useState<string | undefined>();
  const [posterIsLoading, setPosterIsLoading] = useState(false);
  const [showPicture, setShowPicture] = useState(false);
  const [supervisorsToRemove, setSupervisorsToRemove] = useState<Array<Person>>(
    []
  );
  const [role, setRole] = useState<ProjectEditionRole>("VISITOR");
  const [picture, setPicture] = useState<File | undefined>();
  const [documentsToUpload, setDocumentsToUpload] = useState<Array<File>>([]);
  const [documentsToRemove, setDocumentsToRemove] = useState<
    Array<Documentation>
  >([]);
  const onPictureDrop = useCallback((file) => setPicture(file[0]), []);
  const [invalidFile, setInvalidFile] = useState<boolean>(false);
  const [invalidSize, setInvalidSize] = useState<boolean>(false);
  const [invalidImageFormat, setInvalidImageFormat] = useState<boolean>(false);
  const onDrop = useCallback((files) => {
    setDocumentsToUpload(
      documentsToUpload.concat(
        files.filter((f: File) => {
          const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          ];
          if (allowedTypes.includes(f.type)) {
            setInvalidFile(false);
            if (f.size > 26214400) {
              setInvalidSize(true);
              return false;
            } else {
              setInvalidSize(false);
              return true;
            }
          } else {
            setInvalidFile(true);
            return false;
          }
        })
      )
    );
  }, documentsToUpload);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [organization, setOrganization] = useState<
    Organization | undefined | "ERROR"
  >();
  const [justCreatedSupervisors, setJustCreatedSupervisors] = useState<
    Array<Person>
  >([]);
  const [justCreatedAuthors, setJustCreatedAuthors] = useState<Array<Person>>(
    []
  );
  const [titleIncompleted, setTitleIncompleted] = React.useState(false);
  const [descriptionIncompleted, setDescriptionIncompleted] = React.useState(
    false
  );
  const [authors, setAuthors] = useState<Array<Person>>([]);
  const [supervisors, setSupervisors] = useState<Array<Person>>([]);
  const [
    createGhostSupervisorFormOpen,
    setCreateGhostSupervisorFormOpen,
  ] = useState(false);
  const [createGhostAuthorFormOpen, setCreateGhostAuthorFormOpen] = useState(
    false
  );

  const [generatedTags, setGeneratedTags] = useState<Array<string>>([]);
  const [selectedTags, setSelectedTags] = useState<Array<string>>([]);
  const [initialTags, setInitialTags] = useState<Array<string>>([]);
  const [tagsToRemove, setTagsToRemove] = useState<Array<string>>([]);

  const [isLoading, setIsLoading] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const [anchorEl2, setAnchorEl2] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen2 = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    setAnchorEl2(event.currentTarget);
  };

  const handlePopoverClose2 = () => {
    setAnchorEl2(null);
  };

  const [anchorEl3, setAnchorEl3] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen3 = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    setAnchorEl3(event.currentTarget);
  };

  const handlePopoverClose3 = () => {
    setAnchorEl3(null);
  };

  const [anchorEl4, setAnchorEl4] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen4 = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    setAnchorEl4(event.currentTarget);
  };

  const handlePopoverClose4 = () => {
    setAnchorEl4(null);
  };

  const [anchorEl5, setAnchorEl5] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen5 = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    setAnchorEl5(event.currentTarget);
  };

  const handlePopoverClose5 = () => {
    setAnchorEl5(null);
  };

  const open = Boolean(anchorEl);

  const open2 = Boolean(anchorEl2);

  const open3 = Boolean(anchorEl3);

  const open4 = Boolean(anchorEl4);

  const open5 = Boolean(anchorEl5);

  function generateTags() {
    let text = title + " . " + description + " . " + readme;
    if (text.length > 100) {
      generateTagsFromText(text).then((tags) => setGeneratedTags(tags.data));
    }
  }

  function getPdfAsPicture(file: File) {
    generatePdfUrl(file).then((pictureUrl) => {
      setPictureUrl(pictureUrl.data.url);
      setPosterIsLoading(false);
    });
  }

  const project = withProject(props.match.params.id, (p) => {
    setTitle(p.title);
    setInitialTitle(p.title);
    setDescription(p.description);
    setInitialDescription(p.description);
    setReadme(p.extraContent);
    setInitialReadme(p.extraContent);
    if (props.session.isLoggedIn) {
      let id = props.session.userId;
      if (p.authors.some((a) => a.id == id)) {
        setRole("AUTHOR");
      }
      if (p.supervisors.some((s) => s.id == id)) {
        setRole("SUPERVISOR");
      }
    }
    fetchOrganization(p.organization.id)
      .then((res) => res.data)
      .then((o) => setOrganization(o))
      .catch((e) => {
        console.error(e);
        setOrganization("ERROR");
      });
    setAuthors(authors.concat(p.authors));
    setSupervisors(supervisors.concat(p.supervisors));
    setInitialTags(p.tags);
  });

  const theme = createMuiTheme({
    palette: {
      primary: grey,
    },
  });

  if (props.loading) {
    return <div></div>
  }
  if (!props.session.isLoggedIn) {
    return <Redirect to="/login" />;
  }

  if (project.type == PENDING || organization == undefined || isLoading) {
    let color: string = "#c41234";
    if (
      props.session &&
      props.session.isLoggedIn &&
      props.session.selectedOrganization
    ) {
      color = props.session.selectedOrganization.color;
    }
    return <Spinner color={color} />;
  }

  if (project.type == ERROR || organization == "ERROR") {
    return <Redirect to={{ pathname: "/error" }} />;
  }

  function Changes() {
    const changes: Array<Change> = [];

    if (initialTitle != title)
      changes.push({
        undo: () => setTitle(initialTitle),
        render: () => (
          <p>
            Renombrar el proyecto de {initialTitle} a {title}
          </p>
        ),
      });
    if (initialDescription != description)
      changes.push({
        undo: () => setDescription(initialDescription),
        render: () => <p> Actualizar la descripci??n del proyecto</p>,
      });
    if (initialReadme != readme)
      changes.push({
        undo: () => setReadme(initialReadme),
        render: () => <p>Actualizar la descripci??n extendida del proyecto</p>,
      });
    if (picture)
      changes.push({
        undo: () => setPicture(undefined),
        render: () => <p>Actualizar la imagen del proyecto</p>,
      });
    if (pdfPicture)
      changes.push({
        undo: () => {
          setPictureUrl(undefined), setPdfPicture(undefined);
        },
        render: () => <p>Actualizar la imagen del proyecto</p>,
      });
    documentsToUpload.forEach((d) =>
      changes.push({
        undo: () =>
          setDocumentsToUpload(documentsToUpload.filter((dtu) => dtu != d)),
        render: () => <p>Subir el documento {d.name}</p>,
      })
    );
    documentsToRemove.forEach((d) =>
      changes.push({
        undo: () =>
          setDocumentsToRemove(documentsToRemove.filter((dtr) => (dtr! = d))),
        render: () => <p>Borrar el documento {d.fileName}</p>,
      })
    );
    authorsToAdd.forEach((a) =>
      changes.push({
        undo: () => setAuthorsToAdd(authorsToAdd.filter((ata) => ata != a)),
        render: () => <p>Agregar a {a.fullName} como autor</p>,
      })
    );
    justCreatedAuthors.forEach((a) =>
      changes.push({
        undo: () =>
          setJustCreatedAuthors(justCreatedAuthors.filter((jca) => jca != a)),
        render: () => <p>Agregar a {a.fullName} como autor</p>,
      })
    );
    supervisorsToAdd.forEach((s) =>
      changes.push({
        undo: () =>
          setSupervisorsToAdd(supervisorsToAdd.filter((sta) => sta != s)),
        render: () => <p>Agregar a {s.fullName} como supervisor</p>,
      })
    );
    selectedTags.forEach((s) =>
      changes.push({
        undo: () => setSelectedTags(selectedTags.filter((sta) => sta != s)),
        render: () => <p>Agregar tag {s}</p>,
      })
    );
    tagsToRemove.forEach((tag) =>
      changes.push({
        undo: () => setTagsToRemove(tagsToRemove.filter((t) => t != tag)),
        render: () => <p>Eliminar #{tag} </p>,
      })
    );
    justCreatedSupervisors.forEach((s) =>
      changes.push({
        undo: () =>
          setJustCreatedSupervisors(
            justCreatedSupervisors.filter((jcs) => jcs != s)
          ),
        render: () => <p>Agregar a {s.fullName} como supervisor</p>,
      })
    );
    authorsToRemove.forEach((a) =>
      changes.push({
        undo: () =>
          setAuthorsToRemove(authorsToRemove.filter((atr) => atr != a)),
        render: () => <p>Eliminar a {a.fullName} como autor</p>,
      })
    );
    supervisorsToRemove.forEach((s) =>
      changes.push({
        undo: () =>
          setSupervisorsToRemove(supervisorsToRemove.filter((str) => str != s)),
        render: () => <p>Eliminar a {s.fullName} como supervisor</p>,
      })
    );

    return changes;
  }

  if (props.session.isLoggedIn) {
    const id = props.session.userId;

    if (
      !project.value.authors.some((a) => a.id == id) &&
      !project.value.supervisors.some((s) => s.id == id)
    ) {
      return <Redirect to="/error" />;
    }
  }

  function updateProject(project: Project) {
    let promises = [];
    const projectId = project.id;

    //content, documents
    const contentPromise = updateContent(
      projectId,
      project.documentation
        ?.filter((d) => !documentsToRemove.includes(d))
        ?.map((d) => d.id) || [],
      title,
      description,
      readme
    )
      .catch(console.error)
      .then(() => uploadDocuments(projectId, documentsToUpload))
      .catch(console.error);

    promises.push(contentPromise);

    //picture
    if (picture != undefined) {
      promises.push(updatePicture(projectId, picture));
    }

    //picture as pdf
    if (pdfPicture != undefined) {
      promises.push(updatePicture(projectId, pdfPicture));
    }

    //tags
    if (initialTags.concat(selectedTags) != []) {
      promises.push(
        updateTags(
          projectId,
          initialTags
            .concat(selectedTags)
            .filter((t) => !tagsToRemove.some((tag) => tag == t))
        )
      );
    }

    //users
    if (role == "SUPERVISOR") {
      const usersPromise = setProjectUsers(
        project.authors
          .filter((a) => !authorsToRemove.some((atr) => atr.id == a.id))
          .concat(authorsToAdd),
        project.supervisors
          .filter((s) => !supervisorsToRemove.some((str) => str.id == s.id))
          .concat(supervisorsToAdd),
        project.id
      ).catch(console.error);
      promises.push(usersPromise);
    }

    Promise.all(promises)
      .catch(console.error)
      .then(() => props.history.push(`/projects/${projectId}`));
  }

  return (
    <div>
      <Helmet>
        <title>{project.value.title}</title>
      </Helmet>
      <Header
        color="darkGray"
        routes={[]}
        rightLinks={<HeaderLinks />}
        fixed
        {...rest}
      />
      <Parallax filter image={organization.header} small />
      <div className={classes.main}>
        <GridContainer className={classes.container}>
          <GridItem xs={12} sm={12} md={12}>
            <h2
              className={classes.title}
              style={{ textAlign: "center", color: organization.color }}
            >
              EDITAR UN PROYECTO
            </h2>
            <h4
              className={classes.subtitle}
              style={{ textAlign: "left", paddingBottom: "20px" }}
            >
              En esta p??gina vas a poder editar tu proyecto.
            </h4>
          </GridItem>
          <GridItem xs={12} sm={12} md={12}>
            <ThemeProvider theme={theme}>
              <TextField
                fullWidth
                required
                error={titleIncompleted}
                className={classes.autocomplete}
                placeholder="T??tulo"
                value={title}
                onBlur={(e) => {
                  generateTags();
                }}
                onChange={(e) => {
                  if (e.currentTarget.value.trim() == "") {
                    setTitleIncompleted(true);
                  } else {
                    setTitleIncompleted(false);
                  }
                  setTitle(e.currentTarget.value);
                }}
              />
            </ThemeProvider>
          </GridItem>
          <GridItem xs={12} sm={12} md={12}>
            <TextField
              fullWidth
              multiline
              placeholder="Descripci??n"
              error={descriptionIncompleted}
              rowsMax={15}
              rows="3"
              value={description}
              onBlur={(e) => {
                generateTags();
              }}
              onChange={(e) => {
                if (e.currentTarget.value.trim() == "") {
                  setDescriptionIncompleted(true);
                } else {
                  setDescriptionIncompleted(false);
                }
                setDescription(e.currentTarget.value);
              }}
            />
          </GridItem>
          <GridItem>
            <h4 className={classes.subtitle}>
              Contenido extra{" "}
              <Icon
                onMouseEnter={handlePopoverOpen2}
                onMouseLeave={handlePopoverClose2}
                style={{ color: organization.color, verticalAlign: "middle" }}
              >
                help
              </Icon>
            </h4>
            <Popover
              id="mouse-over-popover"
              className={classes.popover}
              classes={{
                paper: classes.paper,
              }}
              open={open2}
              anchorEl={anchorEl2}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              onClose={handlePopoverClose2}
              disableRestoreFocus
            >
              <Typography>
                Pod??s agregar m??s informaci??n sobre tu proyecto para la gente
                que lo visite. Pod??s formatear el contenido y cargar im??genes.
              </Typography>
            </Popover>
            <MEDitor
              value={readme}
              style={{ overflow: "hidden" }}
              onChange={(e) => setReadme(e)}
              onBlur={(e) => generateTags()}
              commands={[
                commands.bold,
                commands.italic,
                commands.strikethrough,
                commands.hr,
                commands.title,
                commands.divider,
                commands.link,
                commands.quote,
                commands.code,
                commands.image,
                commands.divider,
                commands.unorderedListCommand,
                commands.orderedListCommand,
                commands.checkedListCommand,
                commands.divider,
                commands.codeEdit,
                commands.codeLive,
                commands.codePreview,
              ]}
            />
          </GridItem>
          <br />
          <GridItem>
            <h4 className={classes.subtitle}>
              Tags{" "}
              <Icon
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                style={{ color: organization.color, verticalAlign: "middle" }}
              >
                help
              </Icon>
            </h4>
            <Popover
              id="mouse-over-popover"
              className={classes.popover}
              classes={{
                paper: classes.paper,
              }}
              open={open}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              onClose={handlePopoverClose}
              disableRestoreFocus
            >
              <Typography>
                Te recomendamos algunos tags generados a partir del contenido
                que cargaste en los campos anteriores. Los tags sirven para que
                m??s gente pueda encontrar tu proyecto!
              </Typography>
            </Popover>
            {selectedTags.concat(initialTags) ? (
              selectedTags
                .concat(initialTags)
                ?.filter((t) => !tagsToRemove.some((tag) => tag == t))
                ?.map((t, idx) => (
                  <div
                    key={idx}
                    className={classNames(
                      classes.bullet,
                      "underline-hover",
                      "cursor-pointer"
                    )}
                    onClick={() => setTagsToRemove(tagsToRemove.concat(t))}
                  >
                    <RemoveCircle /> {t}
                  </div>
                ))
            ) : (
              <div></div>
            )}
            <GridContainer style={{ display: "flex", alignItems: "center" }}>
              <GridItem xs={12}>
                <Autocomplete
                  fullWidth
                  clearOnBlur
                  options={generatedTags.filter(
                    (s) => !selectedTags.includes(s)
                  )}
                  freeSolo
                  getOptionLabel={(option) => option}
                  onChange={(e, s) => {
                    if (s) setSelectedTags(selectedTags.concat(s!));
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </GridItem>
            </GridContainer>
          </GridItem>
          <GridItem>
            <h4 className={classes.subtitle}>
              Imagen{" "}
              <Icon
                onMouseEnter={handlePopoverOpen3}
                onMouseLeave={handlePopoverClose3}
                style={{ color: organization.color, verticalAlign: "middle" }}
              >
                help
              </Icon>
            </h4>
            <Popover
              id="mouse-over-popover"
              className={classes.popover}
              classes={{
                paper: classes.paper,
              }}
              open={open3}
              anchorEl={anchorEl3}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              onClose={handlePopoverClose3}
              disableRestoreFocus
            >
              <Typography>
                Es la imagen que va a representar a tu proyecto en la p??gina
                principal y en las b??squedas
              </Typography>
            </Popover>
          </GridItem>

          <GridItem xs={12}>
            <div className={classes.root}>
              <input
                accept="image/*"
                className={classes.input}
                id="contained-button-image"
                type="file"
                onChange={(e) => {
                  if (
                    (e.target.files![0].type == "image/jpg" ||
                      e.target.files![0].type == "image/jpeg" ||
                      e.target.files![0].type == "image/png") &&
                    e.target.files![0].size < 26214400
                  ) {
                    setInvalidImageFormat(false);
                    setPdfPicture(undefined);
                    setPictureUrl(undefined);
                    setPicture(e.target.files![0]);
                    setShowPicture(true);
                  } else {
                    setInvalidImageFormat(true);
                  }
                }}
              />
              <label htmlFor="contained-button-image">
                <Button variant="contained" color="primary" component="span">
                  Subir jpg, jpeg or png
                </Button>
              </label>

              <input
                accept="application/pdf"
                className={classes.input}
                id="contained-button-pdf"
                type="file"
                onChange={(e) => {
                  if (
                    e.target.files![0].type == "application/pdf" &&
                    e.target.files![0].size < 26214400
                  ) {
                    setInvalidImageFormat(false);
                    setPictureUrl(undefined);
                    setPosterIsLoading(true);
                    setPicture(undefined);
                    setPdfPicture(e.target.files![0]);
                    getPdfAsPicture(e.target.files![0]);
                    setShowPicture(true);
                  } else {
                    setInvalidImageFormat(true);
                  }
                }}
              />
              <label htmlFor="contained-button-pdf">
                <Button variant="contained" color="primary" component="span">
                  Subir PDF
                </Button>
              </label>
            </div>
            {invalidImageFormat ? (
              <div style={{ color: "red" }}>
                No se pueden subir archivos del tipo seleccionado
              </div>
            ) : (
              <div style={{ display: "none" }}></div>
            )}
          </GridItem>

          <CSSTransition
            in={showPicture}
            timeout={300}
            classNames="image-preview"
            unmountOnExit
          >
            {picture != undefined ? (
              <GridItem
                xs={12}
                style={{ display: "flex", alignItems: "center" }}
              >
                <FilePreview file={picture!!}>
                  {(preview) => <img src={preview} className="image-preview" />}
                </FilePreview>
              </GridItem>
            ) : (
              <div></div>
            )}
          </CSSTransition>

          {posterIsLoading && pdfPicture != undefined ? (
            <GridItem
              xs={12}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Spinner color={organization.color} />
            </GridItem>
          ) : (
            <div style={{ display: "none" }}></div>
          )}

          <CSSTransition
            in={showPicture}
            timeout={300}
            classNames="image-preview"
            unmountOnExit
          >
            {pictureUrl != undefined ? (
              <GridItem
                xs={12}
                style={{ display: "flex", alignItems: "center" }}
              >
                <div className="image-preview">
                  <img
                    src={pictureUrl}
                    className="image-preview"
                    alt="Preview imagen cargada"
                  />
                </div>
              </GridItem>
            ) : (
              <div style={{ display: "none" }}></div>
            )}
          </CSSTransition>

          <GridItem>
            <h4 className={classes.subtitle}>Documentos</h4>
            {project.value.documentation ? (
              project.value.documentation
                ?.filter((d) => !documentsToRemove.some((dtr) => dtr == d))
                ?.map((d, idx) => (
                  <div
                    key={idx}
                    className={classNames(
                      classes.bullet,
                      "underline-hover",
                      "cursor-pointer"
                    )}
                    onClick={() =>
                      setDocumentsToRemove(documentsToRemove.concat(d))
                    }
                  >
                    <RemoveCircle /> {d.fileName}
                  </div>
                ))
            ) : (
              <div></div>
            )}
            {documentsToUpload.map((d, idx) => (
              <div
                key={idx}
                className={classNames(
                  classes.bullet,
                  "underline-hover",
                  "cursor-pointer"
                )}
                onClick={() => {
                  if (documentsToUpload.length < 20) {
                    setDocumentsToUpload(
                      documentsToUpload.filter((doc) => doc != d)
                    );
                  }
                }}
              >
                <RemoveCircle /> {d.name}
              </div>
            ))}
            {invalidFile ? (
              <div style={{ color: "red" }}>
                El tipo de archivo subido es inv??lido
              </div>
            ) : (
              <div style={{ display: "none" }}></div>
            )}
            {invalidSize ? (
              <div style={{ color: "red" }}>
                El archivo supera el l??mite de 25MB
              </div>
            ) : (
              <div style={{ display: "none" }}></div>
            )}
            <section
              className="dropzone-container"
              style={{ marginTop: "15px" }}
            >
              <div {...getRootProps({ className: "dropzone font-size-18-md" })}>
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Arrastr?? los documentos ac??...</p>
                ) : (
                  <p>
                    Arrastr?? los documentos ac??, o hac?? click para seleccionar
                    documentos
                  </p>
                )}
              </div>
            </section>
          </GridItem>
        </GridContainer>
        {role == "SUPERVISOR" ? (
          <GridContainer className={classes.container}>
            <GridItem>
              <h4 className={classes.subtitle}>
                Autores{" "}
                <Icon
                  onMouseEnter={handlePopoverOpen4}
                  onMouseLeave={handlePopoverClose4}
                  style={{ color: organization.color, verticalAlign: "middle" }}
                >
                  help
                </Icon>
              </h4>
              <Popover
                id="mouse-over-popover"
                className={classes.popover}
                classes={{
                  paper: classes.paper,
                }}
                open={open4}
                anchorEl={anchorEl4}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                onClose={handlePopoverClose4}
                disableRestoreFocus
              >
                <Typography>
                  Ac?? pod??s agregar autores al proyecto. Se autocompleta con los
                  que tengan un usuario registrado y que pertenezcan a la
                  organizaci??n seleccionada.<br></br>
                  Tambi??n se pueden agregar colaboradores sin usuarios
                  asignados, ingresando su nombre y mail con la opci??n: "Crear
                  nuevo autor"
                </Typography>
              </Popover>
              {project.value.authors
                .concat(justCreatedAuthors)
                .concat(authorsToAdd)
                .filter((a) => !authorsToRemove.some((atr) => atr == a))
                .sort((a, b) => { return a.fullName.localeCompare(b.fullName) })
                .map((a, idx) => (
                  <div
                    key={idx}
                    className={classNames(
                      classes.bullet,
                      "underline-hover",
                      "cursor-pointer"
                    )}
                    onClick={() => {
                      setAuthorsToRemove(authorsToRemove.concat(a));
                      authorsToAdd.indexOf(a) > -1
                        ? authorsToAdd.splice(authorsToAdd.indexOf(a), 1)
                        : false;
                    }}
                  >
                    <RemoveCircle /> {a.fullName}
                  </div>
                ))}
              <GridContainer>
                <GridItem xs={9}>
                  <Autocomplete
                    fullWidth
                    options={(organization.authors || []).filter(
                      (a) =>
                        !(
                          authorsToAdd.includes(a) ||
                          project.value.authors.includes(a)
                        )
                    )}
                    getOptionLabel={(option) => option.fullName}
                    onChange={(e, a) => {
                      if (
                        authorsToAdd.concat(authors).concat(justCreatedAuthors)
                          .length < 10
                      ) {
                        if (a) {
                          setAuthorsToAdd(authorsToAdd.concat(a!));
                          authorsToRemove.indexOf(a!) > -1
                            ? authorsToRemove.splice(
                                authorsToRemove.indexOf(a!),
                                1
                              )
                            : false;
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <ThemeProvider theme={theme}>
                        <TextField
                          {...params}
                          fullWidth
                          placeholder="Harry Po..."
                        />
                      </ThemeProvider>
                    )}
                  />
                </GridItem>

                <GridItem xs={3}>
                  <CustomButton
                    fullWidth
                    type="button"
                    color={organization.color}
                    disabled={
                      authorsToAdd.concat(authors).concat(justCreatedAuthors)
                        .length == 10
                    }
                    onClick={() => setCreateGhostAuthorFormOpen(true)}
                  >
                    <AddCircle />
                    <Hidden smDown>Crear nuevo autor</Hidden>
                  </CustomButton>
                </GridItem>
              </GridContainer>
            </GridItem>
            <GridItem>
              <h4 className={classes.subtitle}>
                Supervisores{" "}
                <Icon
                  onMouseEnter={handlePopoverOpen5}
                  onMouseLeave={handlePopoverClose5}
                  style={{ color: organization.color, verticalAlign: "middle" }}
                >
                  help
                </Icon>
              </h4>
              <Popover
                id="mouse-over-popover"
                className={classes.popover}
                classes={{
                  paper: classes.paper,
                }}
                open={open5}
                anchorEl={anchorEl5}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                onClose={handlePopoverClose5}
                disableRestoreFocus
              >
                <Typography>
                  Ac?? pod??s agregar supervisores al proyecto. Se autocompleta
                  con los que tengan un usuario registrado y que pertenezcan a
                  la organizaci??n.<br></br>
                  Tambi??n se pueden agregar colaboradores sin usuarios
                  asignados, ingresando su nombre y mail con la opci??n: "Crear
                  nuevo supervisor"
                </Typography>
              </Popover>
              {project.value.supervisors
                .concat(justCreatedSupervisors)
                .concat(supervisorsToAdd)
                .filter(
                  (s) =>
                    !supervisorsToRemove.some((str) => str == s) ||
                    project.value.authors.some((pa) => pa.id == s.id)
                )
                .sort((a, b) => { return a.fullName.localeCompare(b.fullName) })
                .map((s, idx) => (
                  <div
                    key={idx}
                    className={classNames(
                      classes.bullet,
                      "underline-hover",
                      "cursor-pointer"
                    )}
                    onClick={() => {
                      if (props.session.isLoggedIn) {
                        if (s.id != props.session.userId) {
                          setSupervisorsToRemove(supervisorsToRemove.concat(s));
                          supervisorsToAdd.indexOf(s) > -1
                            ? supervisorsToAdd.splice(
                                supervisorsToAdd.indexOf(s),
                                1
                              )
                            : false;
                        }
                      }
                    }}
                  >
                    <RemoveCircle /> {s.fullName}
                  </div>
                ))}
              <GridContainer style={{ display: "flex", alignItems: "center" }}>
                <GridItem xs={9}>
                  <Autocomplete
                    fullWidth
                    clearOnBlur
                    options={(organization.supervisors || []).filter(
                      (s) =>
                        !(
                          supervisorsToAdd.includes(s) ||
                          project.value.supervisors.some((ps) => ps.id == s.id)
                        )
                    )}
                    getOptionLabel={(option) => option.fullName}
                    onChange={(e, s) => {
                      if (
                        supervisorsToAdd
                          .concat(supervisors)
                          .concat(justCreatedSupervisors).length < 7
                      ) {
                        if (s) {
                          setSupervisorsToAdd(supervisorsToAdd.concat(s!));
                          supervisorsToRemove.indexOf(s) > -1
                            ? supervisorsToRemove.splice(
                                supervisorsToRemove.indexOf(s),
                                1
                              )
                            : false;
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        placeholder="Albus Dum..."
                      />
                    )}
                  />
                </GridItem>
                <GridItem xs={3}>
                  <CustomButton
                    fullWidth
                    type="button"
                    color={organization.color}
                    disabled={
                      supervisorsToAdd
                        .concat(supervisors)
                        .concat(justCreatedSupervisors).length == 7
                    }
                    onClick={() => setCreateGhostSupervisorFormOpen(true)}
                  >
                    <AddCircle />
                    <Hidden smDown>Crear nuevo supervisor</Hidden>
                  </CustomButton>
                </GridItem>
              </GridContainer>
            </GridItem>
          </GridContainer>
        ) : (
          <div></div>
        )}
        <GridContainer align="center" className={classes.container}>
          <GridItem xs={12}>
            <Divider variant="fullWidth" />
          </GridItem>
          <GridItem xs={12} align="left">
            <h4 className={classes.subtitle}>
              Cambios, pod??s hacerles click para deshacerlos
            </h4>
            <ul>
              {Changes().map((c, idx) => (
                <li
                  className="cursor-pointer underline-hover"
                  onClick={() => c.undo()}
                  key={idx}
                >
                  {c.render()}
                </li>
              ))}
            </ul>
          </GridItem>
          <GridItem xs={6}></GridItem>
          <GridItem xs={12} align="right">
            <CustomButton
              type="button"
              color="secondary"
              style={{ textAlign: "right" }}
              className={classes.button}
              onClick={() =>
                props.history.push(`/projects/${project.value.id}`)
              }
            >
              Descartar y volver
            </CustomButton>
            <CustomButton
              type="button"
              color={organization.color}
              className={classes.button}
              disabled={titleIncompleted || descriptionIncompleted}
              style={{ textAlign: "right" }}
              onClick={() => setIsModalOpen(true)}
            >
              Guardar cambios
            </CustomButton>
          </GridItem>
        </GridContainer>
      </div>
      <Footer />

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Actualizar {project.value.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ThemeProvider theme={theme}>
                  <CircularProgress />
                </ThemeProvider>
              </div>
            ) : Changes().length == 0 ? (
              <h4>??Uy! Parece que no hiciste ning??n cambio a??n</h4>
            ) : (
              <ul>
                {Changes().map((c, idx) => (
                  <li key={idx}>{c.render()}</li>
                ))}
              </ul>
            )}
          </DialogContentText>
        </DialogContent>
        <ThemeProvider theme={theme}>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)} color="primary">
              No, mejor no
            </Button>
            <Button
              onClick={() => {
                setLoading(true);
                setIsLoading(true);
                updateProject(project.value);
              }}
              color="primary"
              autoFocus
            >
              S??, estoy seguro
            </Button>
          </DialogActions>
        </ThemeProvider>
      </Dialog>
      <CreateGhostUser
        role={"SUPERVISOR"}
        organization={organization}
        project={project.value}
        projects={[]}
        session={props.session}
        open={createGhostSupervisorFormOpen}
        setOpen={setCreateGhostSupervisorFormOpen}
        afterCreate={(p) =>
          setJustCreatedSupervisors(justCreatedSupervisors.concat(p))
        }
      />
      <CreateGhostUser
        role={"AUTHOR"}
        organization={organization}
        project={project.value}
        projects={[]}
        session={props.session}
        open={createGhostAuthorFormOpen}
        setOpen={setCreateGhostAuthorFormOpen}
        afterCreate={(p) => setJustCreatedAuthors(justCreatedAuthors.concat(p))}
      />
    </div>
  );
};

const mapStateToProps = (rootState: RootState) => {
  return {
    session: rootState.session,
    loading: rootState.common.loading
  };
};

export default hot(module)(
  connect(mapStateToProps)(withRouter(EditProjectPage))
);
