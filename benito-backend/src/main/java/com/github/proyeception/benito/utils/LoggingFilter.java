package com.github.proyeception.benito.utils;

import com.google.common.collect.ImmutableList;
import org.apache.commons.collections.EnumerationUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.util.ContentCachingResponseWrapper;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.charset.Charset;
import java.util.Collection;
import java.util.function.Function;
import java.util.stream.Collectors;

public class LoggingFilter implements Filter {
    public static final String AUTHORIZATION_HEADER = "authorization";

    private static final Collection<String> EXCLUDED_URIS = ImmutableList.of("/hello-world");
    private static final Collection<String> EXCLUDED_HEADERS = ImmutableList.of(AUTHORIZATION_HEADER.toLowerCase());

    private static final Logger LOGGER = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException,
        ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        boolean logEnabled = EXCLUDED_URIS.stream().noneMatch(t -> httpServletRequest.getRequestURI().startsWith(t));
        if (logEnabled) {
            CachedContentRequestWrapper httpRequest = new CachedContentRequestWrapper(httpServletRequest);
            ContentCachingResponseWrapper httpResponse =
                new ContentCachingResponseWrapper((HttpServletResponse) response);
            this.logRequest(httpRequest);
            try {
                chain.doFilter(httpRequest, httpResponse);
            } finally {
                this.logResponse(httpResponse);
                httpResponse.copyBodyToResponse();
            }
        } else {
            chain.doFilter(request, response);
        }
    }

    private void logRequest(HttpServletRequest request) throws IOException {
        String queryString = StringUtils.isBlank(request.getQueryString()) ? "" : "?" + request.getQueryString();
        LOGGER.info("[REQUEST] -> {}: {}{}", request.getMethod(), request.getRequestURI(), queryString);
        String headers = this.buildHeaders(EnumerationUtils.toList(request.getHeaderNames()), request::getHeader);
        String body = this.toString(request.getInputStream());
        LOGGER.info("[REQUEST] -> Headers: {} - Body: {}", headers, body);
    }

    private void logResponse(ContentCachingResponseWrapper response) throws IOException {
        int status = response.getStatus();
        LOGGER.info("[RESPONSE] -> Status {}", status);
        String headers = this.buildHeaders(response.getHeaderNames(), response::getHeader);
        String result = this.toString(response.getContentInputStream());
        LOGGER.info("[RESPONSE] -> Headers: {} - Result: {}", headers, result);
    }

    private String toString(InputStream inputStream) throws IOException {
        return StringUtils.replacePattern(StringUtils.trimToEmpty(IOUtils.toString(inputStream,
            Charset.defaultCharset())), "\\r\\n|\\r|\\n", " ");
    }

    private String buildHeaders(Collection<String> headerNames, Function<String, String> headerExtractor) {
        return headerNames.stream()
            .filter(h -> !EXCLUDED_HEADERS.contains(h.toLowerCase()))
            .map(h -> new StringBuilder("'").append(h).append(":").append(headerExtractor.apply(h)).append("'"))
            .collect(Collectors.joining(",", "[", "]"));
    }

    public static class CachedContentRequestWrapper extends HttpServletRequestWrapper {

        private byte[] bodyAsBytes;

        public CachedContentRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        private byte[] getBodyAsBytes() {
            if (this.bodyAsBytes == null) {
                try {
                    this.bodyAsBytes = IOUtils.toByteArray(super.getInputStream());
                } catch (Exception e) {
                    LOGGER.warn("Exception when reading body", e);
                }
            }
            return this.bodyAsBytes;
        }

        @Override
        public ServletInputStream getInputStream() throws IOException {
            return new Wrapper(new ByteArrayInputStream(this.getBodyAsBytes()));
        }

        @Override
        public BufferedReader getReader() throws IOException {
            return new BufferedReader(new InputStreamReader(this.getInputStream()));
        }

        private class Wrapper extends ServletInputStream {

            private final ByteArrayInputStream is;

            public Wrapper(ByteArrayInputStream is) {
                this.is = is;
            }

            @Override
            public int read() throws IOException {
                return this.is.read();
            }

            @Override
            public boolean isFinished() {
                return false;
            }

            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setReadListener(ReadListener readListener) {

            }
        }

    }

    @Override
    public void destroy() {
    }
}