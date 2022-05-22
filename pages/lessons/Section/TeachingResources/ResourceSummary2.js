import React from "react";
import PropTypes from "prop-types";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import { getIcon } from "../../icons";

const ResourceSummary2 = ({ resources = [], footnote }) => {
  if (resources.length === 0) {
    return null;
  }

  const renderRow = ({ itemsGroup = [], itemCat, nItems }, i) => {
    return (
      itemsGroup.length > 0 && (
        <GridContainer key={i}>
          <GridItem md={4}>
            {nItems} {itemCat}
          </GridItem>
          <GridItem md={8}>{itemsGroup.map(renderItem)}</GridItem>
        </GridContainer>
      )
    );
  };

  const renderItem = ({ item, itemExplanation }, i) => {
    return (
      <GridContainer key={i} className="resourceSummaryItem">
        <GridItem xs={2} sm={1}>
        {getIcon(item)}
        </GridItem>
        <GridItem xs={10} sm={11}>
        {item}{" "}
        {typeof itemExplanation === "string" && itemExplanation}
        </GridItem>
      </GridContainer>
    );
  };

  return (
    <div className="ResourceSummary">
      <GridContainer>
        <GridItem className="title">Resources needed:</GridItem>
      </GridContainer>
      {resources.map(renderRow)}
      {footnote && (
        <GridContainer className="footnote">
          <GridItem>{footnote}</GridItem>
        </GridContainer>
      )}
    </div>
  );
};

ResourceSummary2.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.object),
  footnote: PropTypes.node,
};

export default ResourceSummary2;
