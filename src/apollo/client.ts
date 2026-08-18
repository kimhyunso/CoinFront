import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { setContext } from '@apollo/client/link/context';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// JWT 토큰을 HTTP 요청 헤더에 추가
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const httpLink = new HttpLink({
  uri: 'http://localhost:8080/graphql',
});

// WebSocket 연결 시 JWT 토큰 포함
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:8080/graphql',
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return {
        Authorization: token ? `Bearer ${token}` : '',
      };
    },
  })
);

// Query/Mutation → HTTP (authLink 포함), Subscription → WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),  // HTTP 요청에 JWT 헤더 추가
);

export default new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
