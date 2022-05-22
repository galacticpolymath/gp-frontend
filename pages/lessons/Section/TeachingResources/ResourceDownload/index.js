import React from "react";
import PropTypes from "prop-types";

import SimpleResourceDownload from "./Simple";
import VariableResourceDownload from "./Variable";

const ResourceDownload = ({
  Differentiated = false,
  SimpleItem,
  ItemWithVariations,
}) => {
  const resource = Differentiated ? ItemWithVariations : SimpleItem;
  if (!resource) return null;

  return Differentiated ? (
    <VariableResourceDownload {...resource} />
  ) : (
    <SimpleResourceDownload {...resource} />
  );
};

ResourceDownload.propTypes = {
  Differentiated: PropTypes.bool,
  SimpleItem: PropTypes.object,
  ItemWithVariations: PropTypes.object,
};

export default ResourceDownload;
