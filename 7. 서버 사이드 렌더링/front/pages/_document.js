import React from 'react';
import Document, { Main, NextScript } from 'next/document';
import Helmet from 'react-helmet';

class MyDocument extends Document {
  static getInitialProps(context) {
    return { helmet: Helmet.renderStatic() }
  }

  render() {
    const { htmlAttributes, bodyAttributes, ...helmet } = this.props.helmet;
    const htmlAttrs = htmlAttributes.toComponent();
    const bodyAttrs = bodyAttributes.toComponent();

    return (
      <html {...htmlAttrs}>
        <head>
          {Object.values(helmet).map(el => el.toComponent())}
        </head>
        <body {...bodyAttrs}>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
