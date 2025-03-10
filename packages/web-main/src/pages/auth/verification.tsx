import { FC, useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UpdateVerificationFlowBody, VerificationFlow } from '@ory/client';
import { useAuth } from 'hooks/useAuth';
import { styled, Loading } from '@takaro/lib-components';
import { UserAuthCard } from '@ory/elements';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  height: 100vh;

  max-width: 600px;
  text-align: center;
  margin: -200px auto 0 auto;

  gap: ${({ theme }) => theme.spacing[6]};
`;

export const AuthVerification: FC = () => {
  useDocumentTitle('Verification');
  const [flow, setFlow] = useState<VerificationFlow | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { oryClient, oryError } = useAuth();

  const navigate = useNavigate();

  // Get the flow based on the flowId in the URL (.e.g redirect to this page after flow initialized)
  const getFlow = useCallback(
    (flowId: string) =>
      oryClient
        // the flow data contains the form fields, error messages and csrf token
        .getVerificationFlow({ id: flowId })
        .then(({ data: flow }) => setFlow(flow))
        .catch(sdkErrorHandler),
    []
  );

  // initialize the sdkError for generic handling of errors
  const sdkErrorHandler = oryError(getFlow, setFlow, '/verification', true);

  // create a new verification flow
  const createFlow = () => {
    oryClient
      .createBrowserVerificationFlow()
      // flow contains the form fields, error messages and csrf token
      .then(({ data: flow }) => {
        // Update URI query params to include flow id
        setSearchParams({ ['flow']: flow.id });
        // Set the flow data
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  // submit the verification form data to Ory
  const submitFlow = (body: UpdateVerificationFlowBody) => {
    // something unexpected went wrong and the flow was not set
    if (!flow) return navigate('/verification', { replace: true });

    oryClient
      .updateVerificationFlow({
        flow: flow.id,
        updateVerificationFlowBody: body,
      })
      .then(({ data: flow }) => {
        console.log(flow);
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  useEffect(() => {
    // it could happen that we are redirected here with an existing flow
    const flowId = searchParams.get('flow');
    if (flowId) {
      // if the flow failed to get since it could be expired or invalid, we create a new one
      getFlow(flowId).catch(createFlow);
      return;
    }
    createFlow();
  }, []);

  if (!flow) return <Loading />;

  return (
    <>
      <Container>
        <UserAuthCard
          title="Verification"
          flowType={'verification'}
          // we always need to provide the flow data since it contains the form fields, error messages and csrf token
          flow={flow}
          // we want users to be able to go back to the login page from the verification page
          additionalProps={{
            loginURL: '/login',
          }}
          // submit the verification form data to Ory
          onSubmit={({ body }) => submitFlow(body as UpdateVerificationFlowBody)}
        />
      </Container>
    </>
  );
};
