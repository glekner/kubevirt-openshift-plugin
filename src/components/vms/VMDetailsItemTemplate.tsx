import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { TemplateModel } from '@kubevirt-models';
import { TemplateKind } from '@kubevirt-types';
import { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { VMTemplateLink } from '../vm-templates/vm-template-link';

import VMDetailsItem from './VMDetailsItem';

const VMDetailsItemTemplate: React.FC<VMDetailsItemTemplateProps> = ({ name, namespace }) => {
  const { t } = useTranslation();
  const templatesResource: WatchK8sResource = {
    isList: false,
    kind: TemplateModel.kind,
    name,
    namespace,
  };
  const [template, loadedTemplates, errorTemplates] =
    useK8sWatchResource<TemplateKind>(templatesResource);

  return (
    <VMDetailsItem
      title={t('kubevirt-plugin~Template')}
      isLoading={!loadedTemplates}
      isNotAvail={!name || !namespace || (loadedTemplates && !template) || errorTemplates}
    >
      <VMTemplateLink name={name} namespace={namespace} />
    </VMDetailsItem>
  );
};

export type VMDetailsItemTemplateProps = {
  name: string;
  namespace: string;
};

export { VMDetailsItemTemplate as default };
