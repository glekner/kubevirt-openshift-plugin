import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import {
  apiVersionForModel,
  createModalLauncher,
  HandlePromiseProps,
  ModalBody,
  ModalComponentProps,
  ModalSubmitFooter,
  ModalTitle,
  withHandlePromise,
  YellowExclamationTriangleIcon,
} from '@kubevirt-internal';
import { TemplateModel } from '@kubevirt-models';
import { TemplateKind } from '@kubevirt-types';

import { useOwnedVolumeReferencedResources } from '../../../hooks/use-owned-volume-referenced-resources';
import { useUpToDateVMLikeEntity } from '../../../hooks/use-vm-like-entity';
import { deleteVMTemplate } from '../../../k8s/requests/vmtemplate/actions';
import { getName, getNamespace } from '../../../selectors';
import { getVolumes } from '../../../selectors/vm/selectors';
import { asVM } from '../../../selectors/vm/vm';

import { redirectToList } from './utils';

export const DeleteVMTemplateModal = withHandlePromise((props: DeleteVMTemplateModalProps) => {
  const { inProgress, errorMessage, handlePromise, close, cancel, vmTemplate } = props;
  const history = useHistory();

  const { t } = useTranslation('kubevirt-plugin');

  const vmTemplateUpToDate = useUpToDateVMLikeEntity<TemplateKind>(vmTemplate);
  const [deleteDisks, setDeleteDisks] = React.useState<boolean>(true);

  const namespace = getNamespace(vmTemplateUpToDate);
  const name = getName(vmTemplateUpToDate);

  const vmTemplateReference = {
    name,
    kind: TemplateModel.kind,
    apiVersion: apiVersionForModel(TemplateModel),
  } as any;

  const [ownedVolumeResources, isOwnedVolumeResourcesLoaded] = useOwnedVolumeReferencedResources(
    vmTemplateReference,
    namespace,
    getVolumes(asVM(vmTemplateUpToDate), null),
  );
  const isInProgress = inProgress || !isOwnedVolumeResourcesLoaded;
  const numOfAllResources = ownedVolumeResources.length;

  const submit = (e) => {
    e.preventDefault();

    const promise = deleteVMTemplate(vmTemplateUpToDate, {
      ownedVolumeResources,
      deleteOwnedVolumeResources: deleteDisks,
    });

    return handlePromise(promise, () => {
      close();
      redirectToList(history, vmTemplateUpToDate, 'templates');
    });
  };

  return (
    <form onSubmit={submit} className="modal-content">
      <ModalTitle>
        <YellowExclamationTriangleIcon className="co-icon-space-r" />{' '}
        {t('kubevirt-plugin~Delete Virtual Machine Template?')}
      </ModalTitle>
      <ModalBody>
        <Trans t={t} ns="kubevirt-plugin">
          Are you sure you want to delete <strong className="co-break-word">{{ name }}</strong> in
          namespace <strong>{{ namespace }}</strong>?
        </Trans>
        {numOfAllResources > 0 && (
          <p>
            {t(
              'kubevirt-plugin~The following resources will be deleted along with this virtual machine template. Unchecked items will not be deleted.',
            )}
          </p>
        )}
        {ownedVolumeResources.length > 0 && (
          <div className="checkbox">
            <label className="control-label">
              <input
                type="checkbox"
                onChange={() => setDeleteDisks(!deleteDisks)}
                checked={deleteDisks}
              />
              {t('kubevirt-plugin~Delete Disks ({{ownedVolumeResourcesLength}}x)', {
                ownedVolumeResourcesLength: ownedVolumeResources.length,
              })}
            </label>
          </div>
        )}
      </ModalBody>
      <ModalSubmitFooter
        errorMessage={errorMessage}
        submitDisabled={isInProgress}
        inProgress={isInProgress}
        submitText={t('kubevirt-plugin~Delete')}
        submitDanger
        cancel={cancel}
      />
    </form>
  );
});

export type DeleteVMTemplateModalProps = {
  vmTemplate: TemplateKind;
} & ModalComponentProps &
  HandlePromiseProps;

export const deleteVMTemplateModal = createModalLauncher(DeleteVMTemplateModal);
