import * as React from 'react';
import { Link } from 'react-router-dom';

import { ResourceIcon } from '@kubevirt-internal';
import { TemplateModel } from '@kubevirt-models';

export const VMTemplateLink: React.FC<VMTemplateLinkProps> = ({ name, namespace, uid }) => (
  <>
    <ResourceIcon kind={TemplateModel.kind} />
    <Link
      to={`/k8s/ns/${namespace}/vmtemplates/${name}`}
      title={uid}
      data-test-id={name}
      className="co-resource-item__resource-name"
    >
      {name}
    </Link>
  </>
);

type VMTemplateLinkProps = {
  name: string;
  namespace: string;
  uid?: string;
};
