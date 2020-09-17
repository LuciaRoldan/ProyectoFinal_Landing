import axios, { AxiosRequestConfig, AxiosPromise } from "axios";
import { benitoHost } from "../../config";
import { SortMethod } from "../../store/search/types";
import { Project } from "../../types";

export interface Params {
  name?: String;
  category?: String;
  fromDate?: String;
  toDate?: String;
  keyword?: String;
  documentation?: String;
  orderBy?: SortMethod;
}

export function fetchProject(id: String): AxiosPromise<Project> {
  let config: AxiosRequestConfig = {
    url: `${benitoHost}/benito/projects/${id}`,
  };

  return axios.request<Project>(config);
}

export function fetchProjects(params: Params): AxiosPromise<Array<Project>> {
  console.log(params);
  let config: AxiosRequestConfig = {
    url: `${benitoHost}/benito/projects${buildQueryParams(params)}`,
  };

  return axios.request<Array<Project>>(config);
}

export function buildQueryParams({
  name,
  category,
  fromDate,
  toDate,
  orderBy,
  keyword,
}: Params) {
  return "?"
    .concat(buildQueryParamProperty("name", name))
    .concat(buildQueryParamProperty("category", category))
    .concat(buildQueryParamProperty("from", fromDate))
    .concat(buildQueryParamProperty("to", toDate))
    .concat(buildQueryParamProperty("orderBy", orderBy))
    .concat(buildQueryParamProperty("keyword", keyword))
    .slice(0, -1);
  //TODO
  //params = params.concat(this.buildQueryParamProperty("keyword", this.state.keyword))
  //params = params.concat(this.buildQueryParamProperty("documentation", this.state.documentation))
}

function buildQueryParamProperty(key: String, value: String) {
  return value ? key + "=" + value + "&" : "";
}
