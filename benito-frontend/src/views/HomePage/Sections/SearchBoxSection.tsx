import { makeStyles, TextField } from "@material-ui/core";
import React from "react";
import { hot } from "react-hot-loader";
import { connect } from "react-redux";
import { RootState } from "../../../reducers";
import { Category } from "../../../types";
import styles from "../../../assets/jss/material-kit-react/views/homeSections/searchBoxStyle";
import GridContainer from "../../../components/Grid/GridContainer";
import GridItem from "../../../components/Grid/GridItem";
import classNames from "classnames";
import store from "../../../store";
import {
  updateFromDate,
  updateTitle,
  updateToDate,
} from "../../../actions/search";
import { KeyboardDatePicker } from "@material-ui/pickers";
import TitleInput from "../../../components/SearchBox/TitleInput";
import FromDateInput from "../../../components/SearchBox/FromDateInput";
import ToDateInput from "../../../components/SearchBox/ToDateInput";
import CategorySelector from "../../../components/SearchBox/CategorySelector";
import SearchButton from "../../../components/SearchBox/SearchButton";

type SearchBoxSectionProps = {
  title?: string;
  category?: Category;
  from?: Date;
  to?: Date;
};

const useStyles = makeStyles(styles);

const SearchBoxSection = (props: SearchBoxSectionProps) => {
  const classes = useStyles();
  const { ...rest } = props;

  return (
    <div className={classes.section}>
      <GridContainer
        className={classNames(classes.container, classes.searchBox)}
      >
        <GridItem md={12} className={classes.row}>
          <h3>Proyectos</h3>
        </GridItem>
        <GridItem md={4} className={classes.row}>
          <h5>Título</h5>
        </GridItem>
        <GridItem md={4} className={classes.row}>
          <h5>Fechas</h5>
        </GridItem>
        <GridItem md={4} className={classes.row}>
          <h5>Categoría</h5>
        </GridItem>
        <GridItem md={4} className={classes.row}>
          <TitleInput />
        </GridItem>
        <GridItem md={2} className={classes.row}>
          <FromDateInput />
        </GridItem>
        <GridItem md={2} className={classes.row}>
          <ToDateInput />
        </GridItem>
        <GridItem md={2} className={classes.row}>
          <CategorySelector />
        </GridItem>
        <GridItem md={2} className={classes.row}>
          <SearchButton />
        </GridItem>
      </GridContainer>
    </div>
  );
};

const mapStateToProps = (rootState: RootState) => {
  return {
    title: rootState.search.title,
    category: rootState.search.category,
    from: rootState.search.fromDate,
    to: rootState.search.toDate,
  };
};

export default hot(module)(connect(mapStateToProps)(SearchBoxSection));
