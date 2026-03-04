import React from 'react';

type TProcedurePreviewProps = {
  renderProcedurePanel: (...args: any[]) => React.ReactNode;
};

const ProcedurePreview: React.FC<TProcedurePreviewProps> = ({ renderProcedurePanel }) => {
  return <>{renderProcedurePanel(true)}</>;
};

export default ProcedurePreview;
