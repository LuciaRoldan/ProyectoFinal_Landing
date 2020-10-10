import Button from "../CustomButtons/Button";
import React from "react";
import { hot } from "react-hot-loader";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { buildQueryParams } from "../../functions/search";
import { RootState } from "../../reducers";
import { Category, Organization, SortMethod } from "../../types";

interface SearchButtonProps extends RouteComponentProps {
  callback?: () => void;
  categories: Array<Category>;
  organizations: Array<Organization>;
  category?: Category;
  organization?: Organization;
  sort?: SortMethod;
  title?: string;
  from?: Date;
  to?: Date;
  keyword?: string;
}

const SearchButton = (props: SearchButtonProps) => (
  <Button
    color="primary"
    default
    fullWidth
    onClick={() => {
      props.history.push(
        "/search" +
          buildQueryParams({
            ...props,
            category: props.category?.tagName?.valueOf(),
            organizationName: props.organization?.name?.valueOf(),
          })
      );
      if (props.callback) {
        props.callback();
      }
    }}
  >
    Buscar
  </Button>
);

const mapStateToProps = (rootState: RootState) => {
  return {
    categories: rootState.common.categories,
    organizations: rootState.common.organizations,
    title: rootState.search.title,
    category: rootState.search.category,
    sort: rootState.search.orderBy,
    from: rootState.search.fromDate,
    to: rootState.search.toDate,
    organization: rootState.search.organization,
    keyword: rootState.search.keyword,
  };
};

export default hot(module)(connect(mapStateToProps)(withRouter(SearchButton)));