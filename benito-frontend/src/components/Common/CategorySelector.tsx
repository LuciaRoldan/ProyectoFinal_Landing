import React from "react";
import { hot } from "react-hot-loader";
import { Category } from "../../types";
import { RootState } from "../../reducers";
import { connect } from "react-redux";
import store from "../../store";
import { updateCategory } from "../../actions/search";

type Props = {
  categories: Array<Category>;
  selected?: String;
  className?: String;
};

const CategorySelector = (props: Props) => (
  <select
    defaultValue={
      props.selected
        ? props.categories.findIndex((e) => e.tagName == props.selected) + 1
        : 0
    }
    className={`${props.className ? props.className : ""} form-control`}
    onChange={(e) =>
      store.dispatch(
        updateCategory(
          props.categories[e.currentTarget.selectedIndex - 1].tagName
        )
      )
    }
  >
    <option disabled value={0} />
    {props.categories.map((cat, idx) => (
      <option value={idx + 1} key={idx}>
        {cat.name}
      </option>
    ))}
  </select>
);

const mapStateToProps = (rootState: RootState) => {
  return {
    categories: rootState.common.categories,
    selected: rootState.search.category,
  };
};

export default hot(module)(connect(mapStateToProps)(CategorySelector));
