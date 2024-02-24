import React, { useContext, useState } from 'react';
import type { FormProps, ModalProps } from 'antd';
import { Button, Form, Modal } from 'antd';

import type { onCancel } from './action';
import Action, { Context } from './action';

export interface FormModalProps<Values = any> extends ModalProps {
  children?: React.ReactNode;
  onCancel?: onCancel;
  initialValues?: FormProps<Values>['initialValues'];
  onFinish?: FormProps<Values>['onFinish'];
  formProps?: FormProps<Values>;
}

function FormModal<T = any>(props: FormModalProps<T>) {
  const { destroyCallback, ...contextRest } = useContext(Context);
  const {
    children,
    afterClose,
    onCancel,
    initialValues,
    onFinish,
    formProps = {},
    ...rest
  } = { ...contextRest, ...props };
  const [loading, setLoading] = useState(false);

  const handleAfterClose = () => {
    afterClose?.();
    destroyCallback?.();
  };

  const handleOnFinish = async (values: T) => {
    setLoading(true);
    if (loading) return;
    try {
      await onFinish?.(values);
      onCancel?.();
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const modalRender: ModalProps['modalRender'] = (node) => (
    <Form initialValues={initialValues} onFinish={handleOnFinish} {...formProps}>
      {node}
    </Form>
  );

  return (
    <Modal
      modalRender={modalRender}
      afterClose={handleAfterClose}
      onCancel={onCancel}
      destroyOnClose
      footer={
        <>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </>
      }
      {...rest}
    >
      <Action.ContextReset>{children}</Action.ContextReset>
    </Modal>
  );
}

export default FormModal;
