import * as React from 'react';
import { useTranslation } from 'react-i18next';

import {
  createModalLauncher,
  k8sKill,
  ModalBody,
  ModalComponentProps,
  ModalSubmitFooter,
  ModalTitle,
} from '@kubevirt-internal';
import { PersistentVolumeClaimModel } from '@kubevirt-models';

import { DataVolumeModel } from '../../../models';
import { TemplateSourceStatus } from '../../../statuses/template/types';

type DeleteSourceModalProps = ModalComponentProps & {
  sourceStatus: TemplateSourceStatus;
};

const DeleteSourceModal: React.FC<DeleteSourceModalProps> = ({ sourceStatus, cancel, close }) => {
  const { t } = useTranslation();
  const ref = React.useRef(null);
  const [inProgress, setInProgress] = React.useState(false);
  const [error, setError] = React.useState<string>();
  // hack to close template source popup
  // programatically controlled popup is not responsive enough https://github.com/patternfly/patternfly-react/issues/4515
  React.useEffect(() => ref.current?.click(), []);
  const { dataVolume, pvc } = sourceStatus;
  const submit = async (e) => {
    e.preventDefault();
    try {
      setInProgress(true);
      if (dataVolume) {
        await k8sKill(DataVolumeModel, dataVolume);
      } else if (pvc) {
        await k8sKill(PersistentVolumeClaimModel, pvc);
      }
      setInProgress(false);
      close();
    } catch (err) {
      setInProgress(false);
      setError(err.message);
    }
  };

  const sourceName = dataVolume?.metadata?.name || pvc?.metadata?.name;
  return (
    <form onSubmit={submit} className="modal-content" ref={ref}>
      <ModalTitle>{t('kubevirt-plugin~Delete source')}</ModalTitle>
      <ModalBody>
        {t(
          'kubevirt-plugin~Deleting {{sourceName}} from this template will remove it from template for all users.',
          { sourceName },
        )}
      </ModalBody>
      <ModalSubmitFooter
        errorMessage={error}
        inProgress={inProgress}
        submitDanger
        submitText={t('kubevirt-plugin~Delete source')}
        cancel={cancel}
      />
    </form>
  );
};

export const createDeleteSourceModal = createModalLauncher(DeleteSourceModal);
