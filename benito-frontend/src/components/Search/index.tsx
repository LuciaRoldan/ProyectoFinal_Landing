import React, { useEffect, useState } from "react";
import { hot } from "react-hot-loader";
import SearchBox from "./SearchBox";
import ProjectSummary from "./ProjectSummary";
import { RootState } from "../../reducers";
import { connect } from "react-redux";
import { Project } from "../../types";
import store from "../../store";
import {
  updateCategory,
  updateName,
  updateDocumentation,
  updateFromDate,
  updateToDate,
  updateKeyword,
  emptyProjects,
  updateProjects,
  updateSortMethod,
} from "../../actions/search";
import { fetchProjects } from "../../functions/search";
import qs from "qs";
import { RouteChildrenProps } from "react-router-dom";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "../Common/Loader";
import NoResultsFound from "./NoResultsFound";
import SlideIn from "../Common/SlideIn";
import SearchError from "./SearchError";
import OneByOne from "../Common/OneByOne";
import { SortMethod } from "../../store/search/types";
import _ from "lodash";

type MatchParams = {
  name?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
  keyword?: string;
  documentation?: string;
  orderBy?: SortMethod;
};

interface Props extends RouteChildrenProps<MatchParams> {
  projects: Array<Project>;
  name?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
  orderBy?: SortMethod;
}

function passQueryParamsToState(queryParams: MatchParams) {
  queryParams.category
    ? store.dispatch(updateCategory(queryParams.category))
    : {};
  queryParams.name ? store.dispatch(updateName(queryParams.name)) : {};
  queryParams.documentation
    ? store.dispatch(updateDocumentation(queryParams.documentation))
    : {};
  queryParams.fromDate
    ? store.dispatch(updateFromDate(queryParams.fromDate))
    : {};
  queryParams.toDate ? store.dispatch(updateToDate(queryParams.toDate)) : {};
  queryParams.keyword ? store.dispatch(updateKeyword(queryParams.keyword)) : {};
  queryParams.orderBy
    ? store.dispatch(updateSortMethod(queryParams.orderBy))
    : {};
}

const Search = (props: Props) => {
  let queryParams: MatchParams = qs.parse(props.location.search, {
    ignoreQueryPrefix: true,
  });

  const [loading, setLoading] = useState(props.projects.length == 0);
  const [isError, setIsError] = useState(false);

  const search = (params?: MatchParams) => {
    fetchProjects(params && !_.isEmpty(params) ? params : props.match.params)
      .then((res) => res.data)
      .then((ps) => {
        store.dispatch(updateProjects(ps));
      })
      .then(() => setLoading(false))
      .catch((e) => {
        console.error(e);
        setIsError(true);
      });
  };

  useEffect(() => {
    passQueryParamsToState(queryParams);
    search(queryParams);

    return () => {
      store.dispatch(emptyProjects());
    };
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 qui-searchbox-md d-none d-md-block">
          <SearchBox
            searchCallback={() => {
              setLoading(true);
              search(props);
            }}
          />
        </div>
        <div className="col-md-10 bg-white mt-md-5 min-h-240 min-h-720-md">
          <div className="qui-search-header p-2 pl-4 font-size-24 font-size-48-md un-ml-1 un-ml-md-0 un-mr-1 un-mr-0-md">
            Proyectos
          </div>
          {isError ? (
            <SearchError />
          ) : loading ? (
            <div className="center min-h-240 min-h-720-md">
              <Loader />
            </div>
          ) : props.projects.length == 0 ? (
            <NoResultsFound />
          ) : (
            <OneByOne
              containerClassName="pl-4 pr-2 un-ml-3 un-ml-md-0 un-mr-1 un-mr-md-0"
              elements={props.projects.map((p, idx) => (
                <SlideIn key={idx}>
                  <ProjectSummary project={p} />
                </SlideIn>
              ))}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (root: RootState) => {
  return root.search;
};

export default hot(module)(connect(mapStateToProps)(Search));
