# AWS에 배포하기
  
  - [favicon 서빙과 prefetch](#favicon-서빙과-prefetch)
  - [next.config.js](#next.config.js)
  




## favicon 서빙과 prefetch
[위로가기](#AWS에-배포하기)

#### \front\public\favicon.ico
**favicon.ico 추가**

#### \front\server.js
```js
...생략

app.prepare().then(() => {
  const server = express();

  server.use(morgan('dev'));
  // favicon을 적용하기위해서 정적파일을 제공해야한다.
  server.use('/', express.static(patch.join(__dirname, 'public')));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  ...생략
});
```
> favicon을 적용하기위해서 정적파일을 제공해야한다. <br>

#### \front\components\AppLayout.js
```js
...생략

const AppLayout = ({ children }) => {
  const { me } = useSelector(state => state.user);

  const onSearch = (value) => {
    Router.push({ pathname: '/hashtag', query: {tag: value} }, `/hashtag/${value}`);
  };

  return (
    <div>
      <Menu mode="horizontal">
        <Menu.Item key="home"><Link href="/"><a>노드버드</a></Link></Menu.Item>
        <Menu.Item key="profile"><Link href="/profile" prefetch><a>프로필</a></Link></Menu.Item>  // prefetch 추가
          ...생략
      </Menu>
      ...생략
    </div>
  );
};

...생략
```

#### \front\components\UserProfile.js
```js
...생략

const UserProfile = () => {
  ...생략

  return (
    <Card
    actions={[
      <Link href="/profile" prefetch key="twit"> // prefetch 추가
        <a>
          <div>짹짹<br />{me.Posts.length}</div>
        </a>
      </Link>,
      <Link href="/profile" prefetch key="following"> // prefetch 추가
        <a>
          <div>팔로잉<br />{me.Followings.length}</div>
        </a>
      </Link>,
      <Link href="/profile" prefetch key="follower"> // prefetch 추가
        <a>
          <div>팔로워<br />{me.Followers.length}</div>
        </a>
      </Link>,
    ]}
    >
      <Card.Meta
        avatar={<Avatar>{me.nickname[0]}</Avatar>}
        title={me.nickname}
      />
      <Button onClick={onLogout}>로그아웃</Button>
    </Card> 
  )
}

export default UserProfile;
```

> 화면 홈에서 프로필 페이지로 이동하는데 시간이 걸린다. <br>
 >> 빨리 해주기 위해서는 Link에다가 prefech를 넣어주면 된다. <br>
 >> 하지만, 너무 많이 넣어주면, 코드 스플릿 효과가 사라진다. <br>
 >> 그래서, 사람들이 많이 다니는 페이지에다가 해준다. <br>
 >> prefech의 효과는 배포환경에서 제대로 동작을 한다. (개발환경에서는 제대로 동작 안함) <br>


## next.config.js
[위로가기](#AWS에-배포하기)

기본적으로 next가 babel, webpack을 설정해준다. <br>
하지만, 커스텀마이징을 해줘야한다. <br>

next.config.js 웹 팩설정 페이지 : https://nextjs.org/docs/api-reference/next.config.js/introduction  <br>
> 참고로 밑에는 본보기 설정이라서 실직적으로 공식홈페이지 보면서 설정하는게 낫다.

#### next.config.js 
```js
module.exports = {
  distDir: '.next', // dist파일 설정
  webpack(config) { // 웹 팩 설정
    console.log(config); // config에 기본설정들이 다 들어있다.
    return config;
  },
};
```

#### next.config.js 
```js
module.exports = {
  distDir: '.next',
  webpack(config) {
    console.log(config); // config에 기본설정들이 다 들어있다.
    const prod = process.env.NODE_ENV === 'production'; // 배포환경, 개발환경 구분(공통으로 되니까 변수로 설정)
    return {
      ...config, // 기본 설정 적용한다.

      // 여기서부터는 기본 설정을 덮어 씌운다.
      mode: prod ? 'production' : 'development', // 배포환경에는 production, 개발환경에는 development
      devtool: prod ? 'hidden-source-map' : 'eval', // 배포환경에는 hidden-source-map 사용, 개발환경에는 eval을 사용
    };
  },
};
```
> **hidden-source-map** : 소스코드 숨기면서 에러 시 소스맵 제공 <br>
> **eval** : 빠르게 웹팩 적용 <br>

