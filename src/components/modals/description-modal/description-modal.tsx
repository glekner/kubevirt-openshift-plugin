import * as React from 'react';
import { useTranslation } from 'react-i18next';

import {
  createModalLauncher,
  HandlePromiseProps,
  k8sPatch,
  ModalBody,
  ModalComponentProps,
  ModalSubmitFooter,
  ModalTitle,
  withHandlePromise,
} from '@kubevirt-internal';
import { K8sKind, K8sResourceKind } from '@kubevirt-types';
import { TextArea } from '@patternfly/react-core';

import { getUpdateDescriptionPatches } from '../../../k8s/patches/vm/vm-patches';
import { getDescription } from '../../../selectors/selectors';

// TODO: should be moved under kubevirt-plugin/src/style.scss
import './_description-modal.scss';

const DescriptionModal = withHandlePromise((props: DescriptionModalProps) => {
  const { resource, kind, inProgress, errorMessage, handlePromise, close, cancel } = props;

  const { t } = useTranslation();
  const [description, setDescription] = React.useState(getDescription(resource));

  const submit = (e) => {
    e.preventDefault();

    const patches = getUpdateDescriptionPatches(resource, description);
    if (patches.length === 0) {
      close();
    } else {
      const promise = k8sPatch(kind, resource, patches);
      handlePromise(promise, close);
    }
  };

  return (
    <form onSubmit={submit} className="modal-content">
      <ModalTitle>{t('kubevirt-plugin~Edit Description')}</ModalTitle>
      <ModalBody>
        <TextArea
          className="kubevirt-vm-description-modal__description"
          value={description}
          onChange={(d) => setDescription(d)}
          aria-label={t('kubevirt-plugin~description text area')}
        />
      </ModalBody>
      <ModalSubmitFooter
        errorMessage={errorMessage}
        inProgress={inProgress}
        submitText={t('kubevirt-plugin~Save')}
        cancel={cancel}
      />
    </form>
  );
});

export type DescriptionModalProps = HandlePromiseProps &
  ModalComponentProps & {
    resource: K8sResourceKind;
    kind: K8sKind;
  };

export const descriptionModal = createModalLauncher(DescriptionModal);
