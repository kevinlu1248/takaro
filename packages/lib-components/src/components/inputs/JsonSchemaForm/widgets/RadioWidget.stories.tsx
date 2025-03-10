import { RJSFSchema, UiSchema } from '@rjsf/utils';
import React from 'react';
import { JsonSchemaForm } from '..';
import { styled } from '../../../../styled';
import { Button } from '../../../actions';

const Container = styled.div`
  width: 100%;
  padding: 2rem;
`;

export default {
  title: 'Schema/Widgets/Radio',
};

export const Default = () => {
  const schema: RJSFSchema = {
    type: 'object',
    properties: {
      recurrence: {
        description: 'This is the description',
        type: 'string',
        enum: ['Never', 'Daily', 'Weekly', 'Monthly'],
      },
    },
  };

  const uiSchema: UiSchema = {
    recurrence: {
      'ui:widget': 'radioWidget',
    },
  };

  return (
    <Container>
      <JsonSchemaForm schema={schema} initialData={{}} uiSchema={uiSchema}>
        <Button
          type="submit"
          text="Submit"
          onClick={() => console.log('form submitted')}
        />
      </JsonSchemaForm>
    </Container>
  );
};
