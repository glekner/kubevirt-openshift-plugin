import { safeLoad } from 'js-yaml';
import * as React from 'react';

/* eslint-disable lines-between-class-members */
import {
  connectToPlural,
  DroppableEditYAML,
  ErrorPage404,
  LoadingBox,
  resourcePathFromModel,
} from '@kubevirt-internal';
import { k8sList } from '@kubevirt-internal/utils';
import { TemplateModel } from '@kubevirt-models';
import { CreateYAMLProps, K8sResourceKind, TemplateKind } from '@kubevirt-types';

import {
  TEMPLATE_FLAVOR_LABEL,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_WORKLOAD_LABEL,
} from '../../constants/vm';
import { OSSelection } from '../../constants/vm/default-os-selection';
import { VM_TEMPLATE_CREATE_HEADER } from '../../constants/vm-templates';
import { resolveDefaultVMTemplate } from '../../k8s/requests/vm/create/default-template';
import { VMTemplateWrapper } from '../../k8s/wrapper/vm/vm-template-wrapper';
import { VMTemplateYAMLTemplates } from '../../models/templates';
import { getName, getNamespace } from '../../selectors';
console.log('connectToPlural', connectToPlural);

const CreateVMTemplateYAMLConnected = connectToPlural(
  ({ match, kindsInFlight, kindObj }: CreateYAMLProps) => {
    const [defaultTemplate, setDefaultTemplate] = React.useState<TemplateKind>(null);

    React.useEffect(() => {
      k8sList<TemplateKind>(TemplateModel, {
        ns: 'openshift',
        labelSelector: {
          [TEMPLATE_TYPE_LABEL]: TEMPLATE_TYPE_BASE,
          [`${TEMPLATE_FLAVOR_LABEL}/tiny`]: 'true',
          [`${TEMPLATE_WORKLOAD_LABEL}/server`]: 'true',
        },
      })
        .then((templates) => {
          const { osSelection, template: commonTemplate } =
            OSSelection.findSuitableOSAndTemplate(templates);

          if (!commonTemplate) {
            throw new Error('no matching template');
          }

          setDefaultTemplate(
            resolveDefaultVMTemplate({
              commonTemplate,
              name: 'vm-template-example',
              namespace: match.params.ns || 'default',
              baseOSName: osSelection.getValue(),
              containerImage: osSelection.getContainerImage(),
            }),
          );
        })
        .catch(() => {
          setDefaultTemplate(
            new VMTemplateWrapper(safeLoad(VMTemplateYAMLTemplates.getIn(['vm-template'])))
              .init()
              .setNamespace(match.params.ns || 'default')
              .asResource(),
          );
        });
    }, [match.params.ns]);

    if ((!kindObj && kindsInFlight) || !defaultTemplate) {
      return <LoadingBox />;
    }
    if (!kindObj) {
      return <ErrorPage404 message="" />;
    }

    const vmTemplateObjPath = (o: K8sResourceKind) =>
      resourcePathFromModel(
        { ...TemplateModel, plural: 'vmtemplates' },
        getName(o),
        getNamespace(o),
      );

    return (
      <DroppableEditYAML
        obj={defaultTemplate}
        create
        kind={kindObj.kind}
        resourceObjPath={vmTemplateObjPath}
        header={VM_TEMPLATE_CREATE_HEADER}
      />
    );
  },
);

export const CreateVMTemplateYAML = (props: any) => (
  <CreateVMTemplateYAMLConnected {...(props as any)} plural={TemplateModel.plural} />
);
