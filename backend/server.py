from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Motorcycle Types
MOTO_TYPES = [
    "sport",
    "scooter", 
    "adventure",
    "naked",
    "cruiser",
    "enduro",
    "cafe_racer"
]

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

# User Model
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    avatar: Optional[str] = None  # Base64 image
    bio: Optional[str] = None
    country: Optional[str] = None  # User's country preference
    moto_types: List[str] = Field(default_factory=list)  # Preferred motorcycle types
    followers: List[str] = Field(default_factory=list)  # List of user_ids who follow this user
    following: List[str] = Field(default_factory=list)  # List of user_ids this user follows
    favorite_items: List[str] = Field(default_factory=list)  # Favorite market items
    downloaded_tracks: List[str] = Field(default_factory=list)  # Downloaded GPX tracks
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = None
    moto_types: List[str] = Field(default_factory=list)

# Notification Model
class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # User who receives the notification
    type: str  # 'new_post', 'new_follower', 'like', 'market_update', etc.
    from_user_id: str
    from_username: str
    from_avatar: Optional[str] = None
    reference_id: Optional[str] = None  # post_id, event_id, item_id, etc.
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Post Model (Social Feed)
class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    content: str
    image: Optional[str] = None  # Base64 image
    country: Optional[str] = None  # Country where post was made
    moto_type: Optional[str] = None  # Type of motorcycle related to post
    likes: List[str] = Field(default_factory=list)  # List of user_ids who liked
    comments_enabled: bool = True  # Whether comments are allowed
    comments_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PostCreate(BaseModel):
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    content: str
    image: Optional[str] = None
    country: Optional[str] = None
    moto_type: Optional[str] = None
    comments_enabled: bool = True

# Comment Model
class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    user_id: str
    username: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CommentCreate(BaseModel):
    post_id: str
    user_id: str
    username: str
    content: str

# Event Model
class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    location: str
    country: Optional[str] = None  # Country where event takes place
    date: str
    time: str
    image: Optional[str] = None  # Base64 image
    organizer_id: str
    organizer_name: str
    attendees: List[str] = Field(default_factory=list)  # List of user_ids
    max_attendees: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EventCreate(BaseModel):
    title: str
    description: str
    location: str
    country: Optional[str] = None
    date: str
    time: str
    image: Optional[str] = None
    organizer_id: str
    organizer_name: str
    max_attendees: Optional[int] = None

# Trip/Ride Model
class Trip(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    start_location: str
    end_location: str
    country: Optional[str] = None  # Country where ride takes place
    date: str
    time: str
    distance: Optional[str] = None
    duration: Optional[str] = None
    image: Optional[str] = None  # Base64 image
    organizer_id: str
    organizer_name: str
    participants: List[str] = Field(default_factory=list)  # List of user_ids
    max_participants: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TripCreate(BaseModel):
    title: str
    description: str
    start_location: str
    end_location: str
    country: Optional[str] = None
    date: str
    time: str
    distance: Optional[str] = None
    duration: Optional[str] = None
    image: Optional[str] = None
    organizer_id: str
    organizer_name: str
    max_participants: Optional[int] = None

# Market Item Model
class MarketItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    condition: str  # new, like-new, good, fair
    category: str  # parts, accessories, gear, bikes
    images: List[str] = Field(default_factory=list)  # Base64 images
    seller_id: str
    seller_name: str
    contact_info: Optional[str] = None
    location: Optional[str] = None
    country: Optional[str] = None  # Country where item is located
    is_sold: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MarketItemCreate(BaseModel):
    title: str
    description: str
    price: float
    condition: str
    category: str
    images: List[str] = Field(default_factory=list)
    seller_id: str
    seller_name: str
    contact_info: Optional[str] = None
    location: Optional[str] = None
    country: Optional[str] = None

# GPX Track Model
class GpxTrack(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    file_name: str
    file_content: str  # Base64 encoded GPX file
    distance: Optional[str] = None
    elevation_gain: Optional[str] = None
    difficulty: str  # easy, moderate, hard, expert
    region: Optional[str] = None
    country: Optional[str] = None  # Country where track is located
    uploader_id: str
    uploader_name: str
    downloads: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GpxTrackCreate(BaseModel):
    title: str
    description: str
    file_name: str
    file_content: str  # Base64 encoded GPX file
    distance: Optional[str] = None
    elevation_gain: Optional[str] = None
    difficulty: str
    region: Optional[str] = None
    country: Optional[str] = None
    uploader_id: str
    uploader_name: str

# ==================== USER ENDPOINTS ====================

@api_router.post("/users", response_model=User)
async def create_user(user_input: UserCreate):
    user = User(**user_input.dict())
    await db.users.insert_one(user.dict())
    return user

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@api_router.get("/users", response_model=List[User])
async def get_all_users():
    users = await db.users.find().to_list(1000)
    return [User(**user) for user in users]

# ==================== FOLLOW ENDPOINTS ====================

@api_router.post("/users/{user_id}/follow")
async def toggle_follow(user_id: str, follower_id: str, follower_username: str):
    """Toggle follow status. follower_id follows/unfollows user_id"""
    if user_id == follower_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Get or create the user being followed
    user = await db.users.find_one({"id": user_id})
    if not user:
        # Create a basic user record if it doesn't exist
        user = {"id": user_id, "username": "Unknown", "followers": [], "following": []}
        await db.users.insert_one(user)
    
    # Get or create the follower user
    follower = await db.users.find_one({"id": follower_id})
    if not follower:
        follower = {"id": follower_id, "username": follower_username, "followers": [], "following": []}
        await db.users.insert_one(follower)
    
    followers = user.get("followers", [])
    following = follower.get("following", [])
    
    is_following = follower_id in followers
    
    if is_following:
        # Unfollow
        followers.remove(follower_id)
        if user_id in following:
            following.remove(user_id)
    else:
        # Follow
        followers.append(follower_id)
        if user_id not in following:
            following.append(user_id)
        
        # Create notification for the user being followed
        notification = Notification(
            user_id=user_id,
            type="new_follower",
            from_user_id=follower_id,
            from_username=follower_username,
            message=f"{follower_username} started following you"
        )
        await db.notifications.insert_one(notification.dict())
    
    # Update both users
    await db.users.update_one({"id": user_id}, {"$set": {"followers": followers}})
    await db.users.update_one({"id": follower_id}, {"$set": {"following": following}})
    
    return {
        "is_following": not is_following,
        "followers_count": len(followers)
    }

@api_router.get("/users/{user_id}/followers")
async def get_followers(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        return {"followers": [], "following": [], "followers_count": 0, "following_count": 0}
    
    return {
        "followers": user.get("followers", []),
        "following": user.get("following", []),
        "followers_count": len(user.get("followers", [])),
        "following_count": len(user.get("following", []))
    }

@api_router.get("/users/{user_id}/is-following/{target_id}")
async def check_is_following(user_id: str, target_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        return {"is_following": False}
    
    following = user.get("following", [])
    return {"is_following": target_id in following}

# ==================== NOTIFICATION ENDPOINTS ====================

@api_router.get("/notifications/{user_id}")
async def get_notifications(user_id: str, limit: int = 50):
    notifications = await db.notifications.find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(limit)
    
    return [Notification(**n) for n in notifications]

@api_router.get("/notifications/{user_id}/unread-count")
async def get_unread_count(user_id: str):
    count = await db.notifications.count_documents({
        "user_id": user_id,
        "is_read": False
    })
    return {"unread_count": count}

@api_router.post("/notifications/{user_id}/mark-read")
async def mark_notifications_read(user_id: str):
    await db.notifications.update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"message": "Notifications marked as read"}

@api_router.post("/notifications/{notification_id}/read")
async def mark_single_notification_read(notification_id: str):
    await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"is_read": True}}
    )
    return {"message": "Notification marked as read"}

# ==================== USER PROFILE ENDPOINTS ====================

@api_router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get comprehensive user profile with all activity"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        user = {
            "id": user_id,
            "username": "Unknown",
            "followers": [],
            "following": [],
            "favorite_items": [],
            "downloaded_tracks": []
        }
    
    # Get user's posts
    posts = await db.posts.find({"user_id": user_id}).sort("created_at", -1).to_list(50)
    
    # Get events user is attending
    events = await db.events.find({"attendees": user_id}).sort("date", 1).to_list(50)
    
    # Get trips user is participating in
    trips = await db.trips.find({"participants": user_id}).sort("date", 1).to_list(50)
    
    # Get market items user is selling
    selling_items = await db.market_items.find({"seller_id": user_id, "is_sold": False}).to_list(50)
    
    # Get favorite market items
    favorite_ids = user.get("favorite_items", [])
    favorite_items = []
    if favorite_ids:
        favorite_items = await db.market_items.find({"id": {"$in": favorite_ids}}).to_list(50)
    
    # Get downloaded tracks
    downloaded_ids = user.get("downloaded_tracks", [])
    downloaded_tracks = []
    if downloaded_ids:
        downloaded_tracks = await db.gpx_tracks.find({"id": {"$in": downloaded_ids}}).to_list(50)
    
    # Get followers and following user details
    followers_list = []
    following_list = []
    
    if user.get("followers"):
        followers_data = await db.users.find({"id": {"$in": user["followers"]}}).to_list(100)
        followers_list = [{"id": f["id"], "username": f.get("username", "Unknown")} for f in followers_data]
    
    if user.get("following"):
        following_data = await db.users.find({"id": {"$in": user["following"]}}).to_list(100)
        following_list = [{"id": f["id"], "username": f.get("username", "Unknown")} for f in following_data]
    
    return {
        "user": {
            "id": user.get("id"),
            "username": user.get("username"),
            "avatar": user.get("avatar"),
            "bio": user.get("bio"),
            "country": user.get("country"),
            "followers_count": len(user.get("followers", [])),
            "following_count": len(user.get("following", []))
        },
        "posts": [Post(**p).dict() for p in posts],
        "events": [Event(**e).dict() for e in events],
        "trips": [Trip(**t).dict() for t in trips],
        "selling_items": [MarketItem(**i).dict() for i in selling_items],
        "favorite_items": [MarketItem(**i).dict() for i in favorite_items],
        "downloaded_tracks": [GpxTrack(**t).dict() for t in downloaded_tracks],
        "followers": followers_list,
        "following": following_list
    }

@api_router.post("/market/{item_id}/favorite")
async def toggle_favorite_item(item_id: str, user_id: str):
    """Add or remove item from favorites"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        user = {"id": user_id, "favorite_items": []}
        await db.users.insert_one(user)
    
    favorites = user.get("favorite_items", [])
    is_favorite = item_id in favorites
    
    if is_favorite:
        favorites.remove(item_id)
    else:
        favorites.append(item_id)
    
    await db.users.update_one({"id": user_id}, {"$set": {"favorite_items": favorites}})
    return {"is_favorite": not is_favorite}

@api_router.post("/tracks/{track_id}/mark-downloaded")
async def mark_track_downloaded(track_id: str, user_id: str):
    """Record that user downloaded a track"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        user = {"id": user_id, "downloaded_tracks": []}
        await db.users.insert_one(user)
    
    downloads = user.get("downloaded_tracks", [])
    if track_id not in downloads:
        downloads.append(track_id)
        await db.users.update_one({"id": user_id}, {"$set": {"downloaded_tracks": downloads}})
    
    return {"downloaded": True}

# ==================== POST ENDPOINTS ====================

@api_router.post("/posts", response_model=Post)
async def create_post(post_input: PostCreate):
    post = Post(**post_input.dict())
    await db.posts.insert_one(post.dict())
    
    # Send notifications to followers
    user = await db.users.find_one({"id": post_input.user_id})
    if user and user.get("followers"):
        # Create notification for each follower
        notifications = []
        for follower_id in user["followers"]:
            notification = Notification(
                user_id=follower_id,
                type="new_post",
                from_user_id=post_input.user_id,
                from_username=post_input.username,
                from_avatar=post_input.user_avatar,
                reference_id=post.id,
                message=f"{post_input.username} shared a new post"
            )
            notifications.append(notification.dict())
        
        if notifications:
            await db.notifications.insert_many(notifications)
    
    return post

@api_router.get("/posts", response_model=List[Post])
async def get_posts(country: Optional[str] = None):
    query = {}
    if country and country != "all":
        query["country"] = country
    posts = await db.posts.find(query).sort("created_at", -1).to_list(100)
    return [Post(**post) for post in posts]

@api_router.get("/posts/{post_id}", response_model=Post)
async def get_post(post_id: str):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return Post(**post)

@api_router.post("/posts/{post_id}/like")
async def toggle_like(post_id: str, user_id: str, username: str = "Someone"):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    likes = post.get("likes", [])
    was_liked = user_id in likes
    
    if was_liked:
        likes.remove(user_id)
    else:
        likes.append(user_id)
        # Send notification to post owner (if not liking own post)
        if post["user_id"] != user_id:
            notification = Notification(
                user_id=post["user_id"],
                type="like",
                from_user_id=user_id,
                from_username=username,
                reference_id=post_id,
                message=f"{username} liked your post"
            )
            await db.notifications.insert_one(notification.dict())
    
    await db.posts.update_one({"id": post_id}, {"$set": {"likes": likes}})
    return {"likes": likes, "liked": user_id in likes}

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str):
    result = await db.posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    # Also delete related comments
    await db.comments.delete_many({"post_id": post_id})
    return {"message": "Post deleted"}

# ==================== COMMENT ENDPOINTS ====================

@api_router.post("/comments", response_model=Comment)
async def create_comment(comment_input: CommentCreate):
    comment = Comment(**comment_input.dict())
    await db.comments.insert_one(comment.dict())
    # Update comments count on post
    await db.posts.update_one(
        {"id": comment_input.post_id},
        {"$inc": {"comments_count": 1}}
    )
    return comment

@api_router.get("/posts/{post_id}/comments", response_model=List[Comment])
async def get_comments(post_id: str):
    comments = await db.comments.find({"post_id": post_id}).sort("created_at", -1).to_list(100)
    return [Comment(**comment) for comment in comments]

# ==================== EVENT ENDPOINTS ====================

@api_router.post("/events", response_model=Event)
async def create_event(event_input: EventCreate):
    event = Event(**event_input.dict())
    await db.events.insert_one(event.dict())
    return event

@api_router.get("/events", response_model=List[Event])
async def get_events(
    month: Optional[int] = None,
    year: Optional[int] = None,
    location: Optional[str] = None,
    country: Optional[str] = None
):
    query = {}
    
    # Filter by country
    if country and country != "all":
        query["country"] = country
    
    # Filter by month and year if provided
    if month and year:
        # Match dates in format YYYY-MM-DD
        month_str = f"{year}-{month:02d}"
        query["date"] = {"$regex": f"^{month_str}"}
    elif year:
        query["date"] = {"$regex": f"^{year}"}
    
    # Filter by location if provided
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    events = await db.events.find(query).sort("date", 1).to_list(100)
    return [Event(**event) for event in events]

@api_router.get("/events/calendar")
async def get_events_calendar(year: int, country: Optional[str] = None):
    """Get all events for a year grouped by month for calendar view"""
    query = {"date": {"$regex": f"^{year}"}}
    if country and country != "all":
        query["country"] = country
    events = await db.events.find(query).sort("date", 1).to_list(500)
    
    # Group events by month
    calendar = {i: [] for i in range(1, 13)}
    for event in events:
        try:
            date_parts = event["date"].split("-")
            if len(date_parts) >= 2:
                month = int(date_parts[1])
                if 1 <= month <= 12:
                    calendar[month].append(Event(**event).dict())
        except (ValueError, IndexError):
            pass
    
    return {"year": year, "calendar": calendar}

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return Event(**event)

@api_router.post("/events/{event_id}/join")
async def toggle_event_join(event_id: str, user_id: str):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    attendees = event.get("attendees", [])
    if user_id in attendees:
        attendees.remove(user_id)
        joined = False
    else:
        if event.get("max_attendees") and len(attendees) >= event["max_attendees"]:
            raise HTTPException(status_code=400, detail="Event is full")
        attendees.append(user_id)
        joined = True
    
    await db.events.update_one({"id": event_id}, {"$set": {"attendees": attendees}})
    return {"attendees": attendees, "joined": joined}

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}

# ==================== TRIP ENDPOINTS ====================

@api_router.post("/trips", response_model=Trip)
async def create_trip(trip_input: TripCreate):
    trip = Trip(**trip_input.dict())
    await db.trips.insert_one(trip.dict())
    return trip

@api_router.get("/trips", response_model=List[Trip])
async def get_trips(country: Optional[str] = None):
    query = {}
    if country and country != "all":
        query["country"] = country
    trips = await db.trips.find(query).sort("date", 1).to_list(100)
    return [Trip(**trip) for trip in trips]

@api_router.get("/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str):
    trip = await db.trips.find_one({"id": trip_id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return Trip(**trip)

@api_router.post("/trips/{trip_id}/join")
async def toggle_trip_join(trip_id: str, user_id: str):
    trip = await db.trips.find_one({"id": trip_id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    participants = trip.get("participants", [])
    if user_id in participants:
        participants.remove(user_id)
        joined = False
    else:
        if trip.get("max_participants") and len(participants) >= trip["max_participants"]:
            raise HTTPException(status_code=400, detail="Trip is full")
        participants.append(user_id)
        joined = True
    
    await db.trips.update_one({"id": trip_id}, {"$set": {"participants": participants}})
    return {"participants": participants, "joined": joined}

@api_router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str):
    result = await db.trips.delete_one({"id": trip_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Trip deleted"}

# ==================== MARKET ENDPOINTS ====================

@api_router.post("/market", response_model=MarketItem)
async def create_market_item(item_input: MarketItemCreate):
    item = MarketItem(**item_input.dict())
    await db.market_items.insert_one(item.dict())
    return item

@api_router.get("/market", response_model=List[MarketItem])
async def get_market_items(category: Optional[str] = None, country: Optional[str] = None):
    query = {"is_sold": False}
    if category:
        query["category"] = category
    if country and country != "all":
        query["country"] = country
    items = await db.market_items.find(query).sort("created_at", -1).to_list(100)
    return [MarketItem(**item) for item in items]

@api_router.get("/market/{item_id}", response_model=MarketItem)
async def get_market_item(item_id: str):
    item = await db.market_items.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return MarketItem(**item)

@api_router.put("/market/{item_id}/sold")
async def mark_item_sold(item_id: str):
    result = await db.market_items.update_one(
        {"id": item_id},
        {"$set": {"is_sold": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item marked as sold"}

@api_router.delete("/market/{item_id}")
async def delete_market_item(item_id: str):
    result = await db.market_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}

# ==================== GPX TRACK ENDPOINTS ====================

@api_router.post("/tracks", response_model=GpxTrack)
async def create_track(track_input: GpxTrackCreate):
    track = GpxTrack(**track_input.dict())
    await db.gpx_tracks.insert_one(track.dict())
    return track

@api_router.get("/tracks", response_model=List[GpxTrack])
async def get_tracks(
    difficulty: Optional[str] = None,
    region: Optional[str] = None,
    country: Optional[str] = None
):
    query = {}
    if difficulty:
        query["difficulty"] = difficulty
    if region:
        query["region"] = {"$regex": region, "$options": "i"}
    if country and country != "all":
        query["country"] = country
    
    tracks = await db.gpx_tracks.find(query).sort("created_at", -1).to_list(100)
    return [GpxTrack(**track) for track in tracks]

@api_router.get("/tracks/{track_id}", response_model=GpxTrack)
async def get_track(track_id: str):
    track = await db.gpx_tracks.find_one({"id": track_id})
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return GpxTrack(**track)

@api_router.get("/tracks/{track_id}/download")
async def download_track(track_id: str):
    track = await db.gpx_tracks.find_one({"id": track_id})
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    # Increment download count
    await db.gpx_tracks.update_one(
        {"id": track_id},
        {"$inc": {"downloads": 1}}
    )
    
    return {
        "file_name": track["file_name"],
        "file_content": track["file_content"]
    }

@api_router.delete("/tracks/{track_id}")
async def delete_track(track_id: str):
    result = await db.gpx_tracks.delete_one({"id": track_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Track not found")
    return {"message": "Track deleted"}

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "Motorbike Fan App API", "status": "running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
