import React from 'react'
import nookies from 'nookies';
import jwt from 'jsonwebtoken';
import styled from 'styled-components'
import MainGrid from '../src/components/MainGrid'
import Box from '../src/components/Box'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/lib/AlurakutCommons'
import { ProfileRelationsBoxWrapper } from '../src/components/Relations'

const Title = styled.h1`
  font-size: 50px;
  color: ${({ theme }) => theme.colors.primary};
`

function ProfileSideBar(props) {
  return (
    <Box as='aside'>
      <img src={`https://github.com/${props.githubUser}.png`} style={{ borderRadius: '8px' }}/>
      <hr />

      <p>
        <a className='boxLink' href={`https://github.com/${props.githubUser}`}>
          @{props.githubUser}
        </a>
      </p>
      <hr />

      <AlurakutProfileSidebarMenuDefault />
    </Box>
  )
}

function ProfileRelationsBox(propriedades) {
  return (
    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">
        {propriedades.title} ({propriedades.items.length})
      </h2>
      <ul>
        {propriedades.items.map((itemAtual) => {
          return (
            <li key={itemAtual.id}>
              <a href={`https://github.com/${itemAtual.login}`}>
                <img src={`https://github.com/${itemAtual.login}.png`} />
                <span>{itemAtual.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </ProfileRelationsBoxWrapper>
  )
}

export default function Home(props) {
  const githubUser = props.githubUser;
  const [comunidades, setComunidades] = React.useState([]);

  const pessoasFavoritas = [
    'juunegreiros', 
    'omariosouto', 
    'peas', 
    'rafaballerini',
    'marcobrunodev',
    'felipefialho'
  ]

  const [seguidores, setSeguidores] = React.useState([]);
  // 0 - Pegar o array de dados do github 
  React.useEffect(function() {
    fetch(`https://api.github.com/users/${githubUser}/followers`)
    .then(function (respostaDoServidor) {
      return respostaDoServidor.json();
    })
    .then(function(respostaCompleta) {
      setSeguidores(respostaCompleta);
    })

    // API GraphQL
    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': 'c7cdd15aa940651e3dcd33a5ac5cea',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ "query": `query {
        allCommunities {
          id 
          title
          imageUrl
          creatorSlug
        }
      }` })
    })
    .then((response) => response.json()) // Pega o retorno do response.json() e já retorna
    .then((respostaCompleta) => {
      // const comunidadesVindasDoDato = respostaCompleta.data.allCommunities;
      const comunidadesVindasDoDato = ['Odeio segundas feiras'];
      console.log(comunidadesVindasDoDato)
      setComunidades(comunidadesVindasDoDato)
    })
    // .then(function (response) {
    //   return response.json()
    // })

  }, [])

  // 1 - Criar um box que vai ter um map, baseado nos items do array
  // que pegamos do GitHub

  return (
    <>
      <AlurakutMenu githubUser={githubUser}/>
      <MainGrid>
        <div className='profileArea' style={{ gridArea: 'profileArea' }}>
          <ProfileSideBar githubUser={githubUser}/>
        </div>
        <div className='welcomeArea' style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className='title'>
              Bem vindo(a)
            </h1>
            <OrkutNostalgicIconSet></OrkutNostalgicIconSet>
          </Box>
          <Box>
            <h2 className='subTitle'>Qual comunidade você quer criar?</h2>
            <form onSubmit={function handleCreateComunidade(e){
              e.preventDefault();
              const formData = new FormData(e.target);

              const comunidade = {
                  id: new Date().toISOString,
                  title: formData.get('title'),
                  imageUrl: formData.get('image'),
                  creatorSlug: githubUser,
              }

              const newComunidades = [...comunidades, comunidade]
              setComunities(newComunidades)

              fetch('/api/comunidades', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(comunidade)
              })
              .then(async (response) => {
                const dados = await response.json();
                console.log(dados.registroCriado);
                const comunidade = dados.registroCriado;
                const comunidadesAtualizadas = [...comunidades, comunidade];
                setComunidades(comunidadesAtualizadas)
              })              
            }}>
              <div>
                <input 
                  placeholder='Qual vai ser o nome da sua comunidade?'
                  name='title'
                  aria-label='Qual vai ser o nome da sua comunidade?' 
                  type='text'
                />
              </div>
              <div>
                <input 
                  placeholder='Coloque uma URL para usar de capa'
                  name='image'
                  aria-label='Coloque uma URL para usar de capa' />
              </div>

              <button>
                Criar comunidade
              </button>
            </form>
          </Box>
        </div>
        <div className='relationsArea' style={{ gridArea: 'relationsArea' }}>
          <ProfileRelationsBox title="Seguidores" items={seguidores} />
          <ProfileRelationsBoxWrapper>
            <h2 className='smallTitle'>
                Comunidades ({comunidades.length})
            </h2>

            <ul>
                {comunidades.map((itemAtual) => {
                  return (
                    <li key={itemAtual.id}>
                      <a href={`/comunidades/${itemAtual.id}`}>
                        <img src={itemAtual.imageUrl} />
                        <span>{itemAtual.title}</span>
                      </a>
                    </li>
                  )
                })}
            </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
            <h2 className='smallTitle'>
              Amigos ({pessoasFavoritas.length})
            </h2>

            <ul>
              {pessoasFavoritas.map((itemAtual) => {
                return (
                  <li key={itemAtual}>
                    <a href={`/users/${itemAtual}`}>
                      <img src={`https://github.com/${itemAtual}.png`} />
                      <span>{itemAtual}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          <Box>
            Comunidades
          </Box>
        </div>
      </MainGrid>
    </>
  )
}


export async function getServerSideProps(context) {
  const cookies = nookies.get(context)
  const token = cookies.USER_TOKEN;
  const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
        Authorization: token
      }
  })
  .then((resposta) => resposta.json())

  if(!isAuthenticated) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  const { githubUser } = jwt.decode(token);
  return {
    props: {
      githubUser
    }, // will be passed to the page component as props
  }
} 