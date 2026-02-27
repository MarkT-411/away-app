from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
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
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = None

# Post Model (Social Feed)
class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    content: str
    image: Optional[str] = None  # Base64 image
    country: Optional[str] = None  # Country where post was made
    likes: List[str] = Field(default_factory=list)  # List of user_ids who liked
    comments_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PostCreate(BaseModel):
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    content: str
    image: Optional[str] = None
    country: Optional[str] = None

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

# ==================== POST ENDPOINTS ====================

@api_router.post("/posts", response_model=Post)
async def create_post(post_input: PostCreate):
    post = Post(**post_input.dict())
    await db.posts.insert_one(post.dict())
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
async def toggle_like(post_id: str, user_id: str):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    likes = post.get("likes", [])
    if user_id in likes:
        likes.remove(user_id)
    else:
        likes.append(user_id)
    
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
async def get_market_items(category: Optional[str] = None):
    query = {"is_sold": False}
    if category:
        query["category"] = category
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
    region: Optional[str] = None
):
    query = {}
    if difficulty:
        query["difficulty"] = difficulty
    if region:
        query["region"] = {"$regex": region, "$options": "i"}
    
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
