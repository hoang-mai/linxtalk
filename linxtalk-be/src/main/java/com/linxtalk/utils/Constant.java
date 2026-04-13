package com.linxtalk.utils;

public class Constant {

    public static final String WEBSOCKET_MAPPING = "/ws";

    public static final String REQUEST_MAPPING = "/api/v1";

    public static final String USER = REQUEST_MAPPING + "/user";

    public static final String AUTH = REQUEST_MAPPING + "/auth";

    public static final String FRIEND_REQUEST = REQUEST_MAPPING + "/friend-request";

    public static final int MAX_ACCOUNT_PER_DEVICE = 3;

    public static final String PRESENCE_USER_KEY_PREFIX = "presence:user:";

    public static final String PRESENCE_SESSION_KEY_PREFIX = "presence:session:";

    public static final String PRESENCE_OFFLINE_KEY = "presence:offline:";

    public static final String PRESENCE_ONLINE_KEY_PREFIX = "presence:online:";

    public static final int PRESENCE_TTL_SECONDS = 60;

}
