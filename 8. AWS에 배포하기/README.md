# AWS에 배포하기
  
  - [favicon 서빙과 prefetch](#favicon-서빙과-prefetch)
  - [next.config.js](#next.config.js)
  - [next bundle analyzer](#next-bundle-analyzer)
  - [tree shaking 예제와 gzip](#tree-shaking-예제와-gzip)
  




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


## next bundle analyzer
[위로가기](#AWS에-배포하기)

webpack을 설정을 할려면 자기의 소스를 먼저 분석을 해야한다. <br>

<pre><code>npm i @zeit/next-bundle-analyzer</code></pre>
프론트 서버의 패키지들을 분석을 해준다. <br>

공식사이트 참고 : https://github.com/vercel/next-plugins/tree/139d283/packages/next-bundle-analyzer <br>

#### next.config.js
```js
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');

module.exports = withBundleAnalyzer({
  analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
  analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
  bundleAnalyzerConfig: {
    server: {
      analyzerMode: 'static',
      reportFilename: '../bundles/server.html'
    },
    browser: {
      analyzerMode: 'static',
      reportFilename: '../bundles/client.html'
    }
  },
  distDir: '.next',
  webpack(config) {
    console.log('rules', config.module.rules[0]);
    const prod = process.env.NODE_ENV === 'production';
    return {
      ...config,
      mode: prod ? 'production' : 'development',
      devtool: prod ? 'hidden-source-map' : 'eval',
    };
  },
});
```
> **next-bundle-analyzer**의 내용은 공식홈페이지 그대로 복사해서 붙여넣었다. <br>
>> 빌드를 해줄 때 **process.env.BUNDLE_ANALYZE**를 **both**로 만들어주면 프론트, 서버 둘 다 분석을 해준다. <br>
>> 그러기 위해서는 환경변수를 설정해줘야한다. 환경변수 설정은 밑에 package.json에 있다. <br>

#### package.json(BUNDLE_ANALYZE=both 적용)

```js
{
  "name": "react-nodebird-front",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon",
    "build": "BUNDLE_ANALYZE=both next build", // 환경변수 변경 (리눅스, 맥에서만 가능)
    "start": "NODE_ENV=production next start" // 환경변수 변경 (리눅스, 맥에서만 가능)
  },
  ....생략
}
```
> 하지만 window에서는 환경변수 변경하고 사용하면 되지 않는다.!! <br>
>> 해결방안 : **cross-env**를 설치해준다. <br>
<pre><code>npm i cross-env</code></pre>

#### package.json (BUNDLE_ANALYZE=both + cross-env 적용)

```js
{
  "name": "react-nodebird-front",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon",
    "build": "cross-env BUNDLE_ANALYZE=both next build", // 환경변수 변경 (리눅스, 맥에서만 가능)
    "start": "cross-env NODE_ENV=production next start" // 환경변수 변경 (리눅스, 맥에서만 가능)
  },
  ....생략
}
```

그리고 마지막으로, **npm run build**를 하면 소스코드 데이터크기를 분석을 해준다. <br>
<img src="./../8.%20AWS에%20배포하기/front/public/Webpack%20Bundle%20Analyzer%20.png" width="400px" height="300px">

위와 같은 그림으로 분석을 할 수가 있다. <br>
하지만, 데이터가 큰 크기를 잘개 쪼개줘야한다. <br>
> **tree shaking**을 사용한다. (예시: ant design icons tree shaking) <br>
> tree shaking의 자세한 설명은 다음 시간에 <br>


## tree shaking 예제와 gzip
[위로가기](#AWS에-배포하기)

날짜 라이브러리 중에서 **moment**를 많이 사용한다. <br>
<pre><code>npm i moment</code></pre>

> moment 이 외에도, luxon, date-fns가 있다. <br>

#### \front\components\PostCard.js
```js
...생략
import moment from 'moment'; // 추가

moment.locale('ko'); // 추가 : 국적 선택가능(한글 지원)

...생략

const PostCard = ({post}) => {
  ...생략

  return (
    <CardWrapper>
      ...생략
        {post.RetweetId && post.Retweet
          ? (
            ...생략
              ...생략
              // 추가
              // 추가
              <span style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD.')}</span> // 추가
            </Card>
          )
          : ...생략
      </Card>
      ...생략 
    </CardWrapper>
  )
};
...생략

```

여기서 moment의 데이터가 많이 나오게된다. 그래서 데이터 크기를 줄여준다. <br>

#### next.config.js
```js
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const webpack = require('webpack'); // 추가

module.exports = withBundleAnalyzer({
  ...생략
  distDir: '.next',
  webpack(config) {
    const prod = process.env.NODE_ENV === 'production';
    return {
      ...config,
      // ...생략
      plugin: [
        ...config.plugin,
        new webpack.ContextReplacementPlugin(/moment[/\\]local$/, /^\.\/ko$/), // 추가
        // 위에 정보는 moment의 사이트에서 webpack설정이 있으니까 참고한 것이다.
      ]
    };
  },
});

```

#### package.json

```js
{
  ...생략
  "scripts": {
    "dev": "nodemon",
    "build": "cross-env BUNDLE_ANALYZE=both next build",
    "prestart": "npm run build",
    "start": "cross-env NODE_ENV=production next start"
  },
  ...생략
}

```

> 빌드하는 과정이 너무 시간이 걸린다. <br>
>> 그래서 build하고 start하는 과정이 너무 걸리니까, **prestart**가 있다. <br>
>> **prestart**는 start하기 전에 시작하는 명령어이다. <br>
>> 참고로 **poststart**도 있다. start 이후에 실행된다. <br><br>


참고로 이것도 추천한다.
<pre><code>npm i compression-webpack-plugin</code></pre>

#### next.config.js
```js
// ...생략
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = withBundleAnalyzer({
  // ...생략
  distDir: '.next',
  webpack(config) {
    // ...생략
    const prod = process.env.NODE_ENV === 'production';
    return {
      // ...생략
      plugin: [
        ...config.plugins,
        new webpack.ContextReplacementPlugin(/moment[/\\]local$/, /^\.\/ko$/),
        prod && new CompressionPlugin(), // 배포 할 때만 사용하도록 한다.
      ]
    };
  },
});

```

> **CompressionPlugin**의 활용은 확장자 .gz를 만들어준다. <br>
>> **main.js를 main.js.gz**로 해준다. 그리고 용량은 3분의 1을 줄여준다. <br>
>> 용량은 최대한 압축해주고 1MB 이하로 해주는게 좋다. 같은 일을하면서 용량을 줄여주는 큰 장점

#### next.config.js
```js
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = withBundleAnalyzer({
  analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
  analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
  bundleAnalyzerConfig: {
    server: {
      analyzerMode: 'static',
      reportFilename: '../bundles/server.html'
    },
    browser: {
      analyzerMode: 'static',
      reportFilename: '../bundles/client.html'
    }
  },
  distDir: '.next',
  webpack(config) {
    console.log('rules', config.module.rules[0]);
    const prod = process.env.NODE_ENV === 'production';
    const plugins = [
      ...config.plugins,
      new webpack.ContextReplacementPlugin(/moment[/\\]local$/, /^\.\/ko$/),
      prod && new CompressionPlugin(),
    ]
    if (prod) { // 배포 환경일 떄만 설정 -> 이렇게 해준 이유는 개발환경일 떄 오류가 나서..
      plugins.push(new CompressionPlugin());
    }
    return {
      ...config,
      mode: prod ? 'production' : 'development',
      devtool: prod ? 'hidden-source-map' : 'eval',
      plugins,
    };
  },
});
```

> 웹팩 소스코드 다시 고쳐준다.
>> 왜냐하면, 방금 전은 배포할 때에만 설정을 해주었는데, 개발환경일 떄에도 신경써줘야하기 떄문에
>> 소스코드 수정이 있었다.