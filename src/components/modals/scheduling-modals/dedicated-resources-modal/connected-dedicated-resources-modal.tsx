import * as React from 'react';

import { createModalLauncher, Firehose, ModalComponentProps } from '@kubevirt-internal';
import { NodeModel } from '@kubevirt-models';

import { getName, getNamespace } from '../../../../selectors';
import { getVMLikeModel } from '../../../../selectors/vm/vmlike';
import { VMLikeEntityKind } from '../../../../types/vmLike';

import { DedicatedResourcesModal } from './dedicated-resources-modal';

const FirehoseDedicatedResourcesModal: React.FC<FirehoseDedicatedResourcesModalProps> = (props) => {
  const { vmLikeEntity, ...restProps } = props;

  const resources = [
    {
      kind: getVMLikeModel(vmLikeEntity).kind,
      name: getName(vmLikeEntity),
      namespace: getNamespace(vmLikeEntity),
      prop: 'vmLikeEntityLoading',
    },
    {
      kind: NodeModel.kind,
      isList: true,
      namespaced: false,
      prop: 'nodes',
    },
  ];

  return (
    <Firehose resources={resources}>
      <DedicatedResourcesModal vmLikeEntity={vmLikeEntity} {...restProps} />
    </Firehose>
  );
};

type FirehoseDedicatedResourcesModalProps = ModalComponentProps & {
  vmLikeEntity: VMLikeEntityKind;
};

export default createModalLauncher(FirehoseDedicatedResourcesModal);
